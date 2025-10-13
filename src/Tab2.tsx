import { useQuote, useRelayChains, useTokenList, useTokenPrice } from '@relayprotocol/relay-kit-hooks'
import { getClient } from '@relayprotocol/relay-sdk'
import { FixedPointNumber } from 'cafe-utility'
import { useState } from 'react'
import { privateKeyToAccount } from 'viem/accounts'
import { useBalance, useWalletClient } from 'wagmi'
import { fetchSushi } from './sushi/SushiRequest'
import { SwapData } from './SwapData'
import { MultichainTheme } from './Theme'
import { Typography } from './Typography'
import { prefix } from './Utility'

interface Props {
    theme: MultichainTheme
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
}

export function Tab2({ theme, setTab, swapData }: Props) {
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
            fetchSushi(amount.toString(), swapData.temporaryAddress, swapData.targetAddress).then(response => {
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
            })
        } else {
            if (!confirm('Do you want to proceed with the swap?')) {
                return
            }
            if (quote && executeQuote) {
                executeQuote(console.log)
            }
        }
    }

    return (
        <div className="page">
            <div className="multichain__wrapper">
                <button className="multichain__button multichain__button--secondary" onClick={onBack}>
                    Cancel
                </button>
                <label>Source Address</label>
                <input readOnly value={swapData.sourceAddress} />
                <label>Target Address</label>
                <input readOnly value={swapData.targetAddress} />
                <label>Source Chain</label>
                <select
                    value={sourceChain}
                    onChange={e => {
                        setSourceChain(Number(e.target.value))
                        setSourceToken('0x0000000000000000000000000000000000000000')
                    }}
                >
                    {(chains || []).map(chain => (
                        <option key={chain.id} value={chain.id}>
                            {chain.displayName}
                        </option>
                    ))}
                </select>
                <label>Source Token</label>
                <select value={sourceToken} onChange={e => setSourceToken(e.target.value)}>
                    {(data || []).map(token => (
                        <option key={token.address} value={token.address}>
                            {token.symbol} ({token.name})
                        </option>
                    ))}
                </select>
                <Typography>
                    1 {sourceTokenDisplayName} = ${selectedTokenPriceResponse?.price}
                </Typography>
                <Typography>
                    You will swap {amountNeeded} {sourceTokenDisplayName} from {sourceChainDisplayName} to fund:
                </Typography>
                <ul>
                    <li>
                        {swapData.nativeAmount} xDAI (~${swapData.nativeAmount})
                    </li>
                    <li>
                        {swapData.bzzAmount} xBZZ (~${bzzUsdValue.toFixed(2)})
                    </li>
                    <li>
                        <strong>Total: ~${(swapData.nativeAmount + bzzUsdValue).toFixed(2)}</strong>
                    </li>
                </ul>
                <Typography>
                    {isLoading ? 'Quote loading...' : quote ? 'Quote available' : 'Quote NOT available'}
                </Typography>
                <button className="multichain__button" onClick={onSwap}>
                    Fund Node Wallet
                </button>
            </div>
        </div>
    )
}
