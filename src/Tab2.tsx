import { useQuote, useRelayChains, useTokenList } from '@relayprotocol/relay-kit-hooks'
import { getClient } from '@relayprotocol/relay-sdk'
import { MultichainLibrary } from '@upcoming/multichain-library'
import { Arrays, Dates, FixedPointNumber, Numbers, System, Types } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { useBalance, useSwitchChain, useWalletClient } from 'wagmi'
import { AdvancedSelect } from './AdvancedSelect'
import { Button } from './Button'
import { LabelSpacing } from './LabelSpacing'
import { MultichainHooks } from './MultichainHooks'
import { MultichainProgress, MultichainStep } from './MultichainStep'
import { MultichainTheme } from './MultichainTheme'
import { ProgressStatus } from './ProgressStatus'
import { ProgressTracker } from './ProgressTracker'
import { Span } from './Span'
import { SwapData } from './SwapData'
import { TextInput } from './TextInput'
import { TokenDisplay } from './TokenDisplay'
import { Typography } from './Typography'
import { shortenHash } from './Utility'

interface Props {
    theme: MultichainTheme
    hooks: MultichainHooks
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
    initialChainId: number
    library: MultichainLibrary
}

export function Tab2({ theme, hooks, setTab, swapData, initialChainId, library }: Props) {
    // states for user input
    const [sourceChain, setSourceChain] = useState<number>(initialChainId)
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

    // relay and wagmi hooks
    const relayClient = getClient()
    const walletClient = useWalletClient()
    const { chains } = useRelayChains()
    const { data } = useTokenList('https://api.relay.link', { chainIds: [sourceChain] })
    const { switchChainAsync } = useSwitchChain()
    const selectedTokenBalance = useBalance({
        address: swapData.sourceAddress as `0x${string}`,
        token: sourceToken === library.constants.nullAddress ? undefined : (sourceToken as `0x${string}`),
        chainId: sourceChain
    })

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
        const amountNeeded = (totalRemainingUsdValue / selectedTokenUsdPrice) * 1.08 // +8% slippage
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
    const hasSufficientBalance =
        selectedTokenAmountNeeded &&
        selectedTokenBalance.data &&
        selectedTokenAmountNeeded.value <= selectedTokenBalance.data.value

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
        return Arrays.multicall([
            System.runAndSetInterval(() => {
                library
                    .getTokenPrice(sourceToken as `0x${string}`, sourceChain)
                    .then(price => setSelectedTokenUsdPrice(price))
                    .catch(error => {
                        console.error('Error fetching selected token price:', error)
                    })
            }, Dates.minutes(1))
        ])
    }, [sourceChain, sourceToken])

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
            <div className="multichain__row">
                <div className="multichain__column multichain__column--full">
                    <TextInput theme={theme} readOnly value={shortenHash(swapData.sourceAddress)} />
                </div>
                <Typography theme={theme}>→</Typography>
                <div className="multichain__column multichain__column--full">
                    <TextInput theme={theme} readOnly value={shortenHash(swapData.targetAddress)} />
                </div>
            </div>
            {status !== 'pending' ? <ProgressTracker theme={theme} progress={stepStatuses} /> : null}
            {status === 'pending' && nextStep === 'relay' ? (
                <>
                    <LabelSpacing theme={theme}>
                        <Typography theme={theme}>
                            Select the Source Chain
                            <Span theme={theme} color={theme.buttonBackgroundColor}>
                                *
                            </Span>
                        </Typography>
                        <AdvancedSelect
                            theme={theme}
                            onChange={e => {
                                setSourceChain(Number(e))
                                setSourceToken('0x0000000000000000000000000000000000000000')
                            }}
                            onChangeGuard={async chainId => {
                                try {
                                    await switchChainAsync({ chainId: Number(chainId) })
                                    return true
                                } catch (error) {
                                    console.error(error)
                                    alert(
                                        'Failed to switch chain. Is the chain configured in your wallet? More details in console.'
                                    )
                                    return false
                                }
                            }}
                            value={sourceChain.toString()}
                            options={(chains || []).map(chain => ({
                                value: chain.id.toString(),
                                label: chain.displayName,
                                image: chain.iconUrl
                            }))}
                        />
                    </LabelSpacing>
                    <LabelSpacing theme={theme}>
                        <Typography theme={theme}>
                            Select the Source Token
                            <Span theme={theme} color={theme.buttonBackgroundColor}>
                                *
                            </Span>
                        </Typography>
                        <AdvancedSelect
                            theme={theme}
                            onChange={e => setSourceToken(e)}
                            value={sourceToken}
                            options={(data || [])
                                .filter(x => x.address)
                                .map(x => ({
                                    value: x.address!,
                                    label: `${x.symbol} (${x.name})`,
                                    image: x.metadata?.logoURI
                                }))}
                            label={
                                selectedTokenBalance.data
                                    ? Numbers.toSignificantDigits(
                                          new FixedPointNumber(
                                              selectedTokenBalance.data.value,
                                              selectedTokenBalance.data.decimals
                                          ).toDecimalString(),
                                          3
                                      ) +
                                      ' ' +
                                      selectedTokenBalance.data.symbol
                                    : ''
                            }
                        />
                    </LabelSpacing>
                    <Typography theme={theme} small secondary>
                        You will swap{' '}
                        {Numbers.toSignificantDigits(selectedTokenAmountNeeded?.toDecimalString() || '0', 3)} (~$
                        {Numbers.toSignificantDigits(totalUsdValue?.toString() || '0', 2)}) {sourceTokenDisplayName}{' '}
                        from {sourceChainDisplayName} to fund:
                    </Typography>
                    <div className="multichain__row">
                        <div className="multichain__column multichain__column--full">
                            <TokenDisplay
                                theme={theme}
                                leftLabel={`${swapData.nativeAmount.toFixed(2)} xDAI`}
                                rightLabel={`$${swapData.nativeAmount.toFixed(2)}`}
                            />
                        </div>
                        <div className="multichain__column multichain__column--full">
                            <TokenDisplay
                                theme={theme}
                                leftLabel={`${
                                    remainingBzzAmount
                                        ? Numbers.toSignificantDigits(remainingBzzAmount.toDecimalString(), 3)
                                        : '...'
                                } xBZZ`}
                                rightLabel={`$${(remainingBzzUsdValue || 0).toFixed(2)}`}
                            />
                        </div>
                    </div>
                </>
            ) : null}
            {status === 'pending' && nextStep === 'relay' ? (
                isLoading ? (
                    <ProgressStatus theme={theme} status="pending">
                        Loading quote...
                    </ProgressStatus>
                ) : quote ? (
                    <ProgressStatus theme={theme} status="done">
                        Quote available
                    </ProgressStatus>
                ) : (
                    <ProgressStatus theme={theme} status="error">
                        Quote NOT available, amount too small, too large, or insufficient liquidity
                    </ProgressStatus>
                )
            ) : null}
            <Button
                theme={theme}
                onClick={onSwap}
                disabled={status !== 'pending' || (nextStep === 'relay' && !quote) || !hasSufficientBalance}
            >
                {hasSufficientBalance ? 'Fund' : 'Not enough balance'}
            </Button>
        </div>
    )
}
