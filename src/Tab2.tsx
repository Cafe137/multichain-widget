import { useQuote, useRelayChains, useTokenList } from '@relayprotocol/relay-kit-hooks'
import { getClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { Arrays, Dates, FixedPointNumber, System, Types } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { useWalletClient } from 'wagmi'
import { Button } from './Button'
import { LabelSpacing } from './LabelSpacing'
import { MultichainHooks } from './MultichainHooks'
import { MultichainProgress, MultichainStep } from './MultichainStep'
import { MultichainTheme } from './MultichainTheme'
import { ProgressTracker } from './ProgressTracker'
import { Select } from './Select'
import { SwapData } from './SwapData'
import { TextInput } from './TextInput'
import { Typography } from './Typography'

interface Props {
    theme: MultichainTheme
    hooks: MultichainHooks
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
    library: MultichainLibrary
}

export function Tab2({ theme, hooks, setTab, swapData, library }: Props) {
    // states for user input
    const [sourceChain, setSourceChain] = useState<number>(library.constants.ethereumChainId)
    const [sourceToken, setSourceToken] = useState<string>(library.constants.nullAddress)

    // states for network data
    const [bzzPrice, setBzzPrice] = useState<number | null>(null)
    const [temporaryWalletNativeBalance, setTemporaryWalletNativeBalance] = useState<FixedPointNumber | null>(null)
    const [destinationWalletBzzBalance, setDestinationWalletBzzBalance] = useState<FixedPointNumber | null>(null)
    const [selectedTokenUsdPrice, setSelectedTokenUsdPrice] = useState<number | null>(null)

    // states for flow status
    const [status, setStatus] = useState<'pending' | 'running' | 'failed' | 'done'>('pending')
    const [stepStatuses, setStepStatuses] = useState<MultichainProgress>({
        relay: 'pending',
        'relay-sync': 'pending',
        sushi: 'pending',
        'sushi-sync': 'pending',
        transfer: 'pending',
        'transfer-sync': 'pending',
        done: 'pending'
    })

    // relay hooks
    const relayClient = getClient()
    const walletClient = useWalletClient()
    const { chains } = useRelayChains()
    const { data } = useTokenList('https://api.relay.link', { chainIds: [sourceChain] })

    // computed
    const sourceChainDisplayName = (chains || []).find(x => x.id === sourceChain)?.displayName || 'N/A'
    const sourceTokenDisplayName = (data || []).find(x => x.address === sourceToken)?.symbol || 'N/A'
    const sourceTokenObject = (data || []).find(x => x.address === sourceToken)
    const wantedBzz = FixedPointNumber.fromDecimalString(swapData.bzzAmount.toString(), 16)
    let remainingBzzAmount: FixedPointNumber | null = null
    let remainingBzzUsdValue: number | null = null
    let selectedTokenAmountNeeded: FixedPointNumber | null = null
    if (destinationWalletBzzBalance && bzzPrice && selectedTokenUsdPrice && sourceTokenObject?.decimals) {
        remainingBzzAmount = wantedBzz.subtract(destinationWalletBzzBalance)
        remainingBzzUsdValue = parseFloat(remainingBzzAmount.toDecimalString()) * bzzPrice
        const totalRemainingUsdValue = remainingBzzUsdValue + swapData.nativeAmount
        const amountNeeded = totalRemainingUsdValue / selectedTokenUsdPrice
        selectedTokenAmountNeeded = FixedPointNumber.fromDecimalString(
            amountNeeded.toString(),
            sourceTokenObject.decimals
        )
    }
    const totalUsdValue: number | null = remainingBzzUsdValue && swapData.nativeAmount + remainingBzzUsdValue
    const hasEnoughBzz: boolean | null =
        destinationWalletBzzBalance && destinationWalletBzzBalance.compare(wantedBzz) > -1
    const hasRemainingDai: boolean | null =
        temporaryWalletNativeBalance && temporaryWalletNativeBalance.compare(library.constants.daiDustAmount) > -1
    const nextStep: MultichainStep | null =
        hasEnoughBzz === null || hasRemainingDai === null
            ? null
            : hasEnoughBzz
            ? hasRemainingDai
                ? 'transfer'
                : 'done'
            : hasRemainingDai
            ? 'sushi'
            : 'relay'

    // relay quote hook
    const {
        data: quote,
        executeQuote,
        isLoading
    } = useQuote(relayClient ?? undefined, walletClient.data, {
        user: swapData.sourceAddress,
        recipient: swapData.temporaryAddress,
        originChainId: sourceChain,
        destinationChainId: library.constants.gnosisChainId,
        originCurrency: sourceToken,
        destinationCurrency: library.constants.nullAddress, // xDAI
        tradeType: 'EXACT_INPUT',
        amount: selectedTokenAmountNeeded?.toString() || '0'
    })

    // watch bzz price, temp. dai balance and dest. bzz balance
    useEffect(() => {
        return Arrays.multicall([
            System.runAndSetInterval(() => {
                library
                    .getGnosisBzzTokenPrice()
                    .then(price => setBzzPrice(price))
                    .catch(error => {
                        console.error('Error fetching BZZ price:', error)
                    })
            }, Dates.minutes(1)),
            System.runAndSetInterval(() => {
                library
                    .getGnosisNativeBalance(swapData.temporaryAddress)
                    .then(balance => setTemporaryWalletNativeBalance(balance))
                    .catch(error => {
                        console.error('Error fetching temporary wallet native balance:', error)
                    })
            }, Dates.seconds(30)),
            System.runAndSetInterval(() => {
                library
                    .getGnosisBzzBalance(swapData.targetAddress)
                    .then(balance => setDestinationWalletBzzBalance(balance))
                    .catch(error => {
                        console.error('Error fetching destination wallet BZZ balance:', error)
                    })
            }, Dates.seconds(30))
        ])
    }, [])

    // watch selected token price
    useEffect(() => {
        if (!sourceToken) {
            return
        }
        return System.runAndSetInterval(() => {
            library
                .getTokenPrice(sourceToken as `0x${string}`, sourceChain)
                .then(price => setSelectedTokenUsdPrice(price))
                .catch(error => {
                    console.error('Error fetching selected token price:', error)
                })
        }, Dates.minutes(1))
    }, [sourceToken])

    function onBack() {
        setTab(1)
    }

    // main action
    async function onSwap() {
        if (!remainingBzzUsdValue) {
            console.error('BZZ price not loaded yet')
            return
        }
        if (!temporaryWalletNativeBalance) {
            console.error('Temporary wallet native balance not loaded yet')
            return
        }
        if (!destinationWalletBzzBalance) {
            console.error('Destination wallet BZZ balance not loaded yet')
            return
        }
        const stepsToRun: MultichainStep[] =
            nextStep === 'relay'
                ? ['relay', 'sushi', 'transfer']
                : nextStep === 'sushi'
                ? ['sushi', 'transfer']
                : nextStep === 'transfer'
                ? ['transfer']
                : []

        setStepStatuses({
            relay: stepsToRun.includes('relay') ? 'pending' : 'skipped',
            'relay-sync': stepsToRun.includes('relay') ? 'pending' : 'skipped',
            sushi: stepsToRun.includes('sushi') ? 'pending' : 'skipped',
            'sushi-sync': stepsToRun.includes('sushi') ? 'pending' : 'skipped',
            transfer: stepsToRun.includes('transfer') ? 'pending' : 'skipped',
            'transfer-sync': stepsToRun.includes('transfer') ? 'pending' : 'skipped',
            done: 'pending'
        })
        setStatus('running')

        // relay step
        if (stepsToRun.includes('relay')) {
            const daiBefore = temporaryWalletNativeBalance.value
            if (quote && executeQuote) {
                try {
                    setStepStatuses(x => ({ ...x, relay: 'in-progress' }))
                    await executeQuote(console.log)
                    setStepStatuses(x => ({ ...x, relay: 'done' }))
                } catch (error) {
                    setStatus('failed')
                    setStepStatuses(x => ({ ...x, relay: 'error' }))
                    hooks.onFatalError({ step: 'relay', error })
                    throw error
                }
            } else {
                alert('Quote not available, cannot continue.')
                setStatus('failed')
                return
            }
            try {
                setStepStatuses(x => ({ ...x, 'relay-sync': 'in-progress' }))
                await library.waitForGnosisNativeBalanceToIncrease(swapData.temporaryAddress, daiBefore)
                setStepStatuses(x => ({ ...x, 'relay-sync': 'done' }))
            } catch (error) {
                setStatus('failed')
                setStepStatuses(x => ({ ...x, 'relay-sync': 'error' }))
                await hooks.onFatalError({ step: 'relay-sync', error })
                throw error
            }
        }

        // sushi step
        if (stepsToRun.includes('sushi')) {
            const bzzBefore = destinationWalletBzzBalance.value
            const daiBefore = (await library.getGnosisNativeBalance(swapData.temporaryAddress)).value
            try {
                setStepStatuses(x => ({ ...x, sushi: 'in-progress' }))
                const amount = FixedPointNumber.fromDecimalString(remainingBzzUsdValue.toString(), 18)
                await library.swapOnGnosisAuto({
                    amount: amount.toString(),
                    originPrivateKey: swapData.sessionKey,
                    originAddress: swapData.temporaryAddress,
                    to: Types.asHexString(swapData.targetAddress)
                })
                setStepStatuses(x => ({ ...x, sushi: 'done' }))
            } catch (error) {
                setStatus('failed')
                setStepStatuses(x => ({ ...x, sushi: 'error' }))
                await hooks.onFatalError({ step: 'sushi', error })
                throw error
            }
            try {
                setStepStatuses(x => ({ ...x, 'sushi-sync': 'in-progress' }))
                await library.waitForGnosisBzzBalanceToIncrease(swapData.targetAddress, bzzBefore)
                await library.waitForGnosisNativeBalanceToDecrease(swapData.temporaryAddress, daiBefore)
                setStepStatuses(x => ({ ...x, 'sushi-sync': 'done' }))
            } catch (error) {
                setStatus('failed')
                setStepStatuses(x => ({ ...x, 'sushi-sync': 'error' }))
                await hooks.onFatalError({ step: 'sushi-sync', error })
                throw error
            }
        }

        // transfer step
        if (stepsToRun.includes('transfer')) {
            const daiBefore = await library.getGnosisNativeBalance(swapData.temporaryAddress)
            try {
                setStepStatuses(x => ({ ...x, transfer: 'in-progress' }))
                await library.transferGnosisNative({
                    originPrivateKey: swapData.sessionKey,
                    originAddress: swapData.temporaryAddress,
                    to: Types.asHexString(swapData.targetAddress),
                    amount: daiBefore.subtract(library.constants.daiDustAmount).toString()
                })
                setStepStatuses(x => ({ ...x, transfer: 'done' }))
            } catch (error) {
                setStatus('failed')
                setStepStatuses(x => ({ ...x, transfer: 'error' }))
                await hooks.onFatalError({ step: 'transfer', error })
                throw error
            }
            try {
                setStepStatuses(x => ({ ...x, 'transfer-sync': 'in-progress' }))
                await library.waitForGnosisNativeBalanceToDecrease(swapData.temporaryAddress, daiBefore.value)
                setStepStatuses(x => ({ ...x, 'transfer-sync': 'done', done: 'done' }))
            } catch (error) {
                setStatus('failed')
                setStepStatuses(x => ({ ...x, 'transfer-sync': 'error' }))
                await hooks.onFatalError({ step: 'transfer-sync', error })
                throw error
            }
        }

        setStatus('done')
        await hooks.onCompletion()
    }

    return (
        <div
            className="multichain__wrapper"
            style={{ borderRadius: theme.borderRadius, backgroundColor: theme.backgroundColor }}
        >
            <Button secondary theme={theme} onClick={onBack} disabled={status !== 'pending' && status !== 'failed'}>
                Cancel
            </Button>
            <LabelSpacing theme={theme}>
                <Typography theme={theme}>Source Address</Typography>
                <TextInput theme={theme} readOnly value={swapData.sourceAddress} />
            </LabelSpacing>
            <LabelSpacing theme={theme}>
                <Typography theme={theme}>Target Address</Typography>
                <TextInput theme={theme} readOnly value={swapData.targetAddress} />
            </LabelSpacing>
            {status !== 'pending' ? <ProgressTracker theme={theme} progress={stepStatuses} /> : null}
            {status === 'pending' && nextStep === 'relay' ? (
                <>
                    <LabelSpacing theme={theme}>
                        <Typography theme={theme}>Source Chain</Typography>
                        <Select
                            theme={theme}
                            onChange={e => {
                                setSourceChain(Number(e))
                                setSourceToken('0x0000000000000000000000000000000000000000')
                            }}
                            value={sourceChain.toString()}
                            options={(chains || []).map(chain => ({
                                value: chain.id.toString(),
                                label: chain.displayName
                            }))}
                        />
                    </LabelSpacing>
                    <LabelSpacing theme={theme}>
                        <Typography theme={theme}>Source Token</Typography>
                        <Select
                            theme={theme}
                            onChange={e => setSourceToken(e)}
                            value={sourceToken}
                            options={(data || [])
                                .filter(x => x.address)
                                .map(x => ({ value: x.address!, label: `${x.symbol} (${x.name})` }))}
                        />
                        {selectedTokenUsdPrice !== null ? (
                            <Typography theme={theme} small>
                                1 {sourceTokenDisplayName} = ${selectedTokenUsdPrice}
                            </Typography>
                        ) : (
                            <Typography theme={theme}>Loading {sourceTokenDisplayName} price...</Typography>
                        )}
                    </LabelSpacing>
                    <Typography theme={theme}>
                        You will swap {selectedTokenAmountNeeded?.toDecimalString()} (~${totalUsdValue}){' '}
                        {sourceTokenDisplayName} from {sourceChainDisplayName} to fund:
                    </Typography>
                    <div className="multichain__row">
                        <div className="multichain__column multichain__column--full">
                            <TextInput
                                theme={theme}
                                value={`${swapData.nativeAmount.toFixed(2)} xDAI (~$${swapData.nativeAmount.toFixed(
                                    2
                                )})`}
                                readOnly
                            />
                        </div>
                        <div className="multichain__column multichain__column--full">
                            <TextInput
                                theme={theme}
                                value={`${remainingBzzAmount ? remainingBzzAmount.toDecimalString() : '...'} xBZZ (~$${(
                                    remainingBzzUsdValue || 0
                                ).toFixed(2)})`}
                                readOnly
                            />
                        </div>
                    </div>
                </>
            ) : null}

            <Typography theme={theme} small>
                Your temporary wallet has {temporaryWalletNativeBalance?.toDecimalString() || '...'} xDAI
            </Typography>
            <Typography theme={theme} small>
                Your destination wallet has {destinationWalletBzzBalance?.toDecimalString() || '...'} xBZZ
            </Typography>
            {status === 'pending' && nextStep === 'relay' ? (
                <Typography theme={theme}>
                    {isLoading
                        ? 'Quote loading...'
                        : quote
                        ? 'Quote available'
                        : 'Quote NOT available, amount too small, too large, or insufficient liquidity'}
                </Typography>
            ) : null}
            <Button theme={theme} onClick={onSwap} disabled={status !== 'pending' || (nextStep === 'relay' && !quote)}>
                Fund
            </Button>
        </div>
    )
}
