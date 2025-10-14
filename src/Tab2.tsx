import { useQuote, useRelayChains, useTokenList } from '@relayprotocol/relay-kit-hooks'
import { getClient } from '@relayprotocol/relay-sdk'
import { Arrays, Dates, FixedPointNumber, System, Types } from 'cafe-utility'
import { useEffect, useState } from 'react'
import { useWalletClient } from 'wagmi'
import { Button } from './Button'
import { LabelSpacing } from './LabelSpacing'
import { MultichainHooks } from './MultichainHooks'
import { MultichainTheme } from './MultichainTheme'
import { Select } from './Select'
import { SwapData } from './SwapData'
import { TextInput } from './TextInput'
import { Typography } from './Typography'
import { getGnosisBzzBalance } from './library/GnosisBzzBalance'
import { getGnosisNativeBalance } from './library/GnosisNativeBalance'
import { transferGnosisNative } from './library/GnosisNativeTransfer'
import { swapOnGnosisAuto } from './library/GnosisSwap'
import { getGnosisBzzTokenPrice, getTokenPrice } from './library/TokenPrice'

interface Props {
    theme: MultichainTheme
    hooks: MultichainHooks
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
}

export function Tab2({ theme, hooks, setTab, swapData }: Props) {
    // user input
    const [sourceChain, setSourceChain] = useState(1)
    const [sourceToken, setSourceToken] = useState('0x0000000000000000000000000000000000000000')
    // network
    const [bzzPrice, setBzzPrice] = useState<number | null>(null)
    const [temporaryWalletNativeBalance, setTemporaryWalletNativeBalance] = useState<FixedPointNumber | null>(null)
    const [destinationWalletBzzBalance, setDestinationWalletBzzBalance] = useState<FixedPointNumber | null>(null)
    const [selectedTokenUsdPrice, setSelectedTokenUsdPrice] = useState<number | null>(null)
    // computed
    const [selectedTokenAmountNeeded, setSelectedTokenAmountNeeded] = useState<FixedPointNumber | null>(null)

    // hooks
    const relayClient = getClient()
    const walletClient = useWalletClient()
    const { chains } = useRelayChains()
    const { data } = useTokenList('https://api.relay.link', { chainIds: [sourceChain] })

    // relay quote hook
    const {
        data: quote,
        executeQuote,
        isLoading
    } = useQuote(relayClient ?? undefined, walletClient.data, {
        user: swapData.sourceAddress,
        recipient: swapData.temporaryAddress,
        originChainId: sourceChain,
        destinationChainId: 100,
        originCurrency: sourceToken,
        destinationCurrency: '0x0000000000000000000000000000000000000000',
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
            }, Dates.seconds(30)),
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
        }, Dates.seconds(30))
    }, [sourceToken])

    // calculate amount needed of the selected token
    useEffect(() => {
        if (!bzzPrice || !selectedTokenUsdPrice || !sourceToken) {
            return
        }
        const sourceTokenObject = (data || []).find(x => x.address === sourceToken)
        if (!sourceTokenObject) {
            console.error('Selected token not found in token list')
            return
        }
        if (!sourceTokenObject.decimals) {
            console.error('Selected token decimals not found')
            return
        }
        const bzzUsdValue = swapData.bzzAmount * bzzPrice
        const totalUsdValue = bzzUsdValue + swapData.nativeAmount
        const amountNeeded = totalUsdValue / selectedTokenUsdPrice
        const amount = FixedPointNumber.fromDecimalString(amountNeeded.toString(), sourceTokenObject.decimals)
        setSelectedTokenAmountNeeded(amount)
    }, [bzzPrice, sourceToken, selectedTokenUsdPrice])

    // computed chain and token display names
    const sourceChainDisplayName = (chains || []).find(x => x.id === sourceChain)?.displayName || 'N/A'
    const sourceTokenDisplayName = (data || []).find(x => x.address === sourceToken)?.symbol || 'N/A'

    function onBack() {
        setTab(1)
    }

    async function onSwap() {
        if (!bzzPrice) {
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
        if (destinationWalletBzzBalance.compare(FixedPointNumber.fromDecimalString('1', 16)) > -1) {
            alert('The destination address already has 1 or more BZZ, ready to transfer DAI.')
            if (!confirm('Do you want to transfer DAI to the destination address now?')) {
                return
            }
            transferGnosisNative({
                originPrivateKey: swapData.sessionKey,
                originAddress: swapData.temporaryAddress,
                to: Types.asHexString(swapData.targetAddress),
                amount: temporaryWalletNativeBalance.subtract(FixedPointNumber.fromDecimalString('0.01', 18)).toString()
            }).catch(error => hooks.onFatalError({ step: 'transfer', error }))
            return
        } else {
            const nativeBalanceNeeded = FixedPointNumber.fromDecimalString(swapData.nativeAmount + bzzUsdValue, 18)
            if (temporaryWalletNativeBalance.compare(nativeBalanceNeeded) > -1) {
                alert('Your temporary wallet has enough funds already!')
                if (!confirm('Do you want to trade and send to the destination address?')) {
                    return
                }
                const amount = FixedPointNumber.fromDecimalString((bzzPrice * swapData.bzzAmount).toString(), 18)
                alert(`Swapping ${amount.toDecimalString()} xDAI for ${swapData.bzzAmount} xBZZ`)
                swapOnGnosisAuto({
                    amount: amount.toString(),
                    originPrivateKey: swapData.sessionKey,
                    originAddress: swapData.temporaryAddress,
                    to: Types.asHexString(swapData.targetAddress)
                }).catch(error => hooks.onFatalError({ step: 'sushi', error }))
            } else {
                if (!confirm('Do you want to proceed with the Relay swap?')) {
                    return
                }
                if (quote && executeQuote) {
                    executeQuote(console.log)?.catch(error => {
                        hooks.onFatalError({ step: 'relay', error })
                    })
                }
            }
        }
    }

    const bzzUsdValue = bzzPrice ? (swapData.bzzAmount * bzzPrice).toFixed(2) : '0'
    const totalUsdValue = bzzPrice ? (swapData.nativeAmount + swapData.bzzAmount * bzzPrice).toFixed(2) : '0'

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
                </LabelSpacing>
                {selectedTokenUsdPrice !== null ? (
                    <Typography theme={theme}>
                        1 {sourceTokenDisplayName} = ${selectedTokenUsdPrice}
                    </Typography>
                ) : (
                    <Typography theme={theme}>Loading {sourceTokenDisplayName} price...</Typography>
                )}
                <Typography theme={theme}>
                    You will swap {selectedTokenAmountNeeded?.toDecimalString()} {sourceTokenDisplayName} from{' '}
                    {sourceChainDisplayName} to fund:
                </Typography>
                <Typography theme={theme}>
                    {swapData.nativeAmount} xDAI (~${swapData.nativeAmount})
                </Typography>
                <Typography theme={theme}>
                    {swapData.bzzAmount} xBZZ (~${bzzUsdValue})
                </Typography>
                <Typography theme={theme}>
                    <strong>Total: ~${totalUsdValue}</strong>
                </Typography>
                <Typography theme={theme}>
                    Your temporary wallet has {temporaryWalletNativeBalance?.toDecimalString() || '...'} xDAI
                </Typography>
                <Typography theme={theme}>
                    Your destination wallet has {destinationWalletBzzBalance?.toDecimalString() || '...'} xBZZ
                </Typography>
                <Typography theme={theme}>
                    {isLoading
                        ? 'Quote loading...'
                        : quote
                        ? 'Quote available'
                        : 'Quote NOT available, amount too small, too large, or insufficient liquidity'}
                </Typography>
                <Button theme={theme} onClick={onSwap}>
                    Begin Funding
                </Button>
            </div>
        </div>
    )
}
