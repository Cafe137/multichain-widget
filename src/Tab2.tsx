import { useQuote, useRelayChains, useTokenList } from '@relayprotocol/relay-kit-hooks'
import { getClient } from '@relayprotocol/relay-sdk'
import { Arrays, Dates, FixedPointNumber, System, Types } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { useWalletClient } from 'wagmi'
import { Button } from './Button'
import { LabelSpacing } from './LabelSpacing'
import { Constants } from './library/Constants'
import { getGnosisBzzBalance } from './library/GnosisBzzBalance'
import { getGnosisNativeBalance } from './library/GnosisNativeBalance'
import { transferGnosisNative } from './library/GnosisNativeTransfer'
import { swapOnGnosisAuto } from './library/GnosisSwap'
import { getGnosisBzzTokenPrice, getTokenPrice } from './library/TokenPrice'
import {
    waitForGnosisBzzBalanceToIncrease,
    waitForGnosisNativeBalanceToDecrease,
    waitForGnosisNativeBalanceToIncrease
} from './library/Waiter'
import { MultichainHooks } from './MultichainHooks'
import { MultichainTheme } from './MultichainTheme'
import { Select } from './Select'
import { SwapData } from './SwapData'
import { TextInput } from './TextInput'
import { Typography } from './Typography'

interface Props {
    theme: MultichainTheme
    hooks: MultichainHooks
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
}

export function Tab2({ theme, hooks, setTab, swapData }: Props) {
    // states for user input
    const [sourceChain, setSourceChain] = useState<number>(Constants.ethereumChainId)
    const [sourceToken, setSourceToken] = useState<string>(Constants.nullAddress)

    // states for network data
    const [bzzPrice, setBzzPrice] = useState<number | null>(null)
    const [temporaryWalletNativeBalance, setTemporaryWalletNativeBalance] = useState<FixedPointNumber | null>(null)
    const [destinationWalletBzzBalance, setDestinationWalletBzzBalance] = useState<FixedPointNumber | null>(null)
    const [selectedTokenUsdPrice, setSelectedTokenUsdPrice] = useState<number | null>(null)

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

    // computed for logic only
    const hasEnoughBzz: boolean | null =
        destinationWalletBzzBalance && destinationWalletBzzBalance.compare(wantedBzz) > -1
    const hasRemainingDai: boolean | null =
        temporaryWalletNativeBalance && temporaryWalletNativeBalance.compare(Constants.daiDustAmount) > -1
    const nextStep: string | null =
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
        destinationChainId: Constants.gnosisChainId,
        originCurrency: sourceToken,
        destinationCurrency: Constants.nullAddress, // xDAI
        tradeType: 'EXACT_INPUT',
        amount: selectedTokenAmountNeeded?.toString() || '0'
    })

    // watch bzz price, temp. dai balance and dest. bzz balance
    useEffect(() => {
        return Arrays.multicall([
            System.runAndSetInterval(() => {
                getGnosisBzzTokenPrice()
                    .then(price => setBzzPrice(price))
                    .catch(error => {
                        console.error('Error fetching BZZ price:', error)
                    })
            }, Dates.minutes(1)),
            System.runAndSetInterval(() => {
                getGnosisNativeBalance(swapData.temporaryAddress)
                    .then(balance => setTemporaryWalletNativeBalance(balance))
                    .catch(error => {
                        console.error('Error fetching temporary wallet native balance:', error)
                    })
            }, Dates.seconds(30)),
            System.runAndSetInterval(() => {
                getGnosisBzzBalance(swapData.targetAddress)
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
            getTokenPrice(sourceToken as `0x${string}`, sourceChain)
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
        // 1. nothing to do, already funded
        if (nextStep === 'done') {
            alert('The destination wallet already has enough BZZ, and the temporary wallet has no DAI left.')
            return
        }
        // 2. only xDAI transfer needed, already have enough BZZ
        if (nextStep === 'transfer') {
            alert('The destination address already has the wanted amount of BZZ, ready to transfer DAI.')
            if (!confirm('Continue?')) {
                return
            }
            // send all but dust amount to target
            try {
                await transferGnosisNative({
                    originPrivateKey: swapData.sessionKey,
                    originAddress: swapData.temporaryAddress,
                    to: Types.asHexString(swapData.targetAddress),
                    amount: temporaryWalletNativeBalance.subtract(Constants.daiDustAmount).toString()
                })
                await waitForGnosisNativeBalanceToDecrease(
                    swapData.temporaryAddress,
                    temporaryWalletNativeBalance.value
                )
                await hooks.onCompletion()
            } catch (error) {
                await hooks.onFatalError({ step: 'transfer', error })
                throw error
            }
            return
        }
        // 3. xDAI is on the temporary wallet, but destination needs BZZ
        if (nextStep === 'sushi') {
            alert('The destination address needs BZZ, ready to swap on Sushi and transfer DAI.')
            if (!confirm('Continue?')) {
                return
            }
            try {
                // 3.1 swap and send to target
                const amount = FixedPointNumber.fromDecimalString(remainingBzzUsdValue.toString(), 18)
                const bzzBefore = destinationWalletBzzBalance.value
                const daiBefore = temporaryWalletNativeBalance.value
                await swapOnGnosisAuto({
                    amount: amount.toString(),
                    originPrivateKey: swapData.sessionKey,
                    originAddress: swapData.temporaryAddress,
                    to: Types.asHexString(swapData.targetAddress)
                })
                await waitForGnosisBzzBalanceToIncrease(swapData.targetAddress, bzzBefore)
                await waitForGnosisNativeBalanceToDecrease(swapData.temporaryAddress, daiBefore)
            } catch (error) {
                await hooks.onFatalError({ step: 'sushi', error })
                throw error
            }
            try {
                // 3.2 send all but dust amount to target
                const daiBefore = await getGnosisNativeBalance(swapData.temporaryAddress)
                await transferGnosisNative({
                    originPrivateKey: swapData.sessionKey,
                    originAddress: swapData.temporaryAddress,
                    to: Types.asHexString(swapData.targetAddress),
                    amount: daiBefore.subtract(Constants.daiDustAmount).toString()
                })
                await waitForGnosisNativeBalanceToDecrease(swapData.temporaryAddress, daiBefore.value)
                await hooks.onCompletion()
            } catch (error) {
                await hooks.onFatalError({ step: 'transfer', error })
                throw error
            }
            return
        }
        // 4. need to do a relay swap and the rest as well
        alert('The destination address needs BZZ, ready to do a Relay swap, Sushi swap and transfer DAI.')
        if (!confirm('Continue?')) {
            return
        }
        if (quote && executeQuote) {
            try {
                // 4.1 do relay swap
                const daiBefore = temporaryWalletNativeBalance.value
                await executeQuote(console.log)
                await waitForGnosisNativeBalanceToIncrease(swapData.temporaryAddress, daiBefore)
            } catch (error) {
                hooks.onFatalError({ step: 'relay', error })
                throw error
            }
            try {
                // 4.2 swap and send to target
                const amount = FixedPointNumber.fromDecimalString(remainingBzzUsdValue.toString(), 18)
                const bzzBefore = destinationWalletBzzBalance.value
                const daiBefore = (await getGnosisNativeBalance(swapData.temporaryAddress)).value
                await swapOnGnosisAuto({
                    amount: amount.toString(),
                    originPrivateKey: swapData.sessionKey,
                    originAddress: swapData.temporaryAddress,
                    to: Types.asHexString(swapData.targetAddress)
                })
                await waitForGnosisBzzBalanceToIncrease(swapData.targetAddress, bzzBefore)
                await waitForGnosisNativeBalanceToDecrease(swapData.temporaryAddress, daiBefore)
            } catch (error) {
                await hooks.onFatalError({ step: 'sushi', error })
                throw error
            }
            try {
                // 4.3 send all but dust amount to target
                const daiBefore = await getGnosisNativeBalance(swapData.temporaryAddress)
                await transferGnosisNative({
                    originPrivateKey: swapData.sessionKey,
                    originAddress: swapData.temporaryAddress,
                    to: Types.asHexString(swapData.targetAddress),
                    amount: daiBefore.subtract(Constants.daiDustAmount).toString()
                })
                await waitForGnosisNativeBalanceToDecrease(swapData.temporaryAddress, daiBefore.value)
                await hooks.onCompletion()
            } catch (error) {
                await hooks.onFatalError({ step: 'transfer', error })
                throw error
            }
        } else {
            alert('Quote not available, cannot continue.')
            return
        }
    }

    return (
        <div className="page">
            <div
                className="multichain__wrapper"
                style={{ borderRadius: theme.borderRadius, backgroundColor: theme.backgroundColor }}
            >
                <Button secondary theme={theme} onClick={onBack}>
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
                {nextStep === 'relay' && (
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
                                    value={`${
                                        remainingBzzAmount ? remainingBzzAmount.toDecimalString() : '...'
                                    } xBZZ (~$${(remainingBzzUsdValue || 0).toFixed(2)})`}
                                    readOnly
                                />
                            </div>
                        </div>
                    </>
                )}
                <Typography theme={theme} small>
                    Your temporary wallet has {temporaryWalletNativeBalance?.toDecimalString() || '...'} xDAI
                </Typography>
                <Typography theme={theme} small>
                    Your destination wallet has {destinationWalletBzzBalance?.toDecimalString() || '...'} xBZZ
                </Typography>
                {nextStep === 'relay' ? (
                    <Typography theme={theme}>
                        {isLoading
                            ? 'Quote loading...'
                            : quote
                            ? 'Quote available'
                            : 'Quote NOT available, amount too small, too large, or insufficient liquidity'}
                    </Typography>
                ) : null}
                <Button theme={theme} onClick={onSwap} disabled={nextStep === 'relay' && !quote}>
                    Fund
                </Button>
            </div>
        </div>
    )
}
