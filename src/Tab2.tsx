import { useQuote, useRelayChains, useTokenList, useTokenPrice } from '@relayprotocol/relay-kit-hooks'
import { getClient } from '@relayprotocol/relay-sdk'
import { FixedPointNumber } from 'cafe-utility'
import { useState } from 'react'
import { privateKeyToAccount } from 'viem/accounts'
import { useBalance, useWalletClient } from 'wagmi'
import { Button } from './Button'
import { LabelSpacing } from './LabelSpacing'
import { MultichainHooks } from './MultichainHooks'
import { MultichainTheme } from './MultichainTheme'
import { Select } from './Select'
import { fetchSushi } from './sushi/SushiRequest'
import { SwapData } from './SwapData'
import { TextInput } from './TextInput'
import { Typography } from './Typography'
import { prefix } from './Utility'

interface Props {
    theme: MultichainTheme
    hooks: MultichainHooks
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
}

export function Tab2({ theme, hooks, setTab, swapData }: Props) {
    const [sourceChain, setSourceChain] = useState(1)
    const [sourceToken, setSourceToken] = useState('0x0000000000000000000000000000000000000000')

    const relayClient = getClient()
    const walletClient = useWalletClient()

    const { chains } = useRelayChains()
    const { data } = useTokenList('https://api.relay.link', { chainIds: [sourceChain] })

    const sourceTokenObject = (data || []).find(x => x.address === sourceToken)

    const { data: bzzPriceResponse } = useTokenPrice('https://api.relay.link', {
        address: '0xdbf3ea6f5bee45c02255b2c26a16f300502f68da',
        chainId: 100
    })
    const { data: selectedTokenPriceResponse } = useTokenPrice('https://api.relay.link', {
        address: sourceToken,
        chainId: sourceChain
    })
    const { data: balanceResponse } = useBalance({
        address: prefix(swapData.temporaryAddress),
        chainId: 100
    })

    const bzzPrice = bzzPriceResponse?.price || 0.11
    const bzzUsdValue = swapData.bzzAmount * bzzPrice
    const totalUsdValue = bzzUsdValue + swapData.nativeAmount
    const amountNeeded = totalUsdValue / (selectedTokenPriceResponse?.price || 1)
    const amount = FixedPointNumber.fromDecimalString(
        amountNeeded.toString(),
        sourceTokenObject?.decimals || 18
    ).toString()

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
        amount
    })

    const sourceChainDisplayName = (chains || []).find(x => x.id === sourceChain)?.displayName || 'N/A'
    const sourceTokenDisplayName = (data || []).find(x => x.address === sourceToken)?.symbol || 'N/A'

    function onBack() {
        setTab(1)
    }

    function onSwap() {
        if (!balanceResponse) {
            alert('Balance not loaded')
            return
        }
        alert(`Your temporary wallet has a balance of ${balanceResponse.value} ${balanceResponse.symbol}`)
        if (balanceResponse.value > 10000000n) {
            alert('Your temporary wallet has enough funds already!')
            if (!confirm('Do you want to trade and send to the destination address?')) {
                return
            }
            const amount = FixedPointNumber.fromDecimalString((bzzPrice * swapData.bzzAmount).toString(), 18)
            alert(`Swapping ${amount.toDecimalString()} xDAI for ${swapData.bzzAmount} xBZZ`)
            fetchSushi(amount.toString(), swapData.temporaryAddress, swapData.targetAddress)
                .then(response => {
                    const account = privateKeyToAccount(swapData.sessionKey)
                    account
                        .signTransaction({
                            chain: 100,
                            chainId: 100,
                            account: swapData.temporaryAddress,
                            gas: BigInt(response.tx.gas),
                            gasPrice: BigInt(response.tx.gasPrice),
                            type: 'legacy',
                            to: response.tx.to,
                            value: BigInt(response.tx.value),
                            data: response.tx.data
                        })
                        .then(signedTx => {
                            walletClient.data?.sendRawTransaction({ serializedTransaction: signedTx }).then(console.log)
                        })
                        .catch(error => hooks.onFatalError({ step: 'sushi-transaction', error }))
                })
                .catch(error => hooks.onFatalError({ step: 'sushi-request', error }))
        } else {
            if (!confirm('Do you want to proceed with the swap?')) {
                return
            }
            if (quote && executeQuote) {
                executeQuote(console.log)?.catch(error => {
                    hooks.onFatalError({ step: 'relay', error })
                })
            }
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
                <Typography theme={theme}>
                    1 {sourceTokenDisplayName} = ${selectedTokenPriceResponse?.price}
                </Typography>
                <Typography theme={theme}>
                    You will swap {amountNeeded} {sourceTokenDisplayName} from {sourceChainDisplayName} to fund:
                </Typography>
                <Typography theme={theme}>
                    {swapData.nativeAmount} xDAI (~${swapData.nativeAmount})
                </Typography>
                <Typography theme={theme}>
                    {swapData.bzzAmount} xBZZ (~${bzzUsdValue.toFixed(2)})
                </Typography>
                <Typography theme={theme}>
                    <strong>Total: ~${(swapData.nativeAmount + bzzUsdValue).toFixed(2)}</strong>
                </Typography>
                <Typography theme={theme}>
                    {isLoading ? 'Quote loading...' : quote ? 'Quote available' : 'Quote NOT available'}
                </Typography>
                <Button theme={theme} onClick={onSwap}>
                    Begin Funding
                </Button>
            </div>
        </div>
    )
}
