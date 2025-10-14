import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { gnosis } from 'viem/chains'
import { getSushiSwapQuote } from './SushiSwap'

interface AutoOptions {
    amount: string | bigint
    originPrivateKey: `0x${string}`
    originAddress: `0x${string}`
    to: `0x${string}`
}

export async function swapOnGnosisAuto(options: AutoOptions) {
    const quote = await getSushiSwapQuote(options.amount.toString(), options.originAddress, options.to)
    return swapOnGnosisCustom({
        originPrivateKey: options.originPrivateKey,
        originAddress: options.originAddress,
        gas: BigInt(quote.tx.gas),
        gasPrice: BigInt(quote.tx.gasPrice),
        to: quote.tx.to,
        value: BigInt(quote.tx.value),
        data: quote.tx.data
    })
}

interface CustomOptions {
    originPrivateKey: `0x${string}`
    originAddress: `0x${string}`
    gas: bigint | string | number
    gasPrice: bigint | string | number
    to: `0x${string}`
    value: bigint | string | number
    data: `0x${string}`
}

export async function swapOnGnosisCustom(options: CustomOptions) {
    const account = privateKeyToAccount(options.originPrivateKey)
    const client = createWalletClient({
        chain: gnosis,
        transport: http('https://rpc.gnosischain.com/')
    })
    return account
        .signTransaction({
            chain: 100,
            chainId: 100,
            account: options.originAddress,
            gas: BigInt(options.gas),
            gasPrice: BigInt(options.gasPrice),
            type: 'legacy',
            to: options.to,
            value: BigInt(options.value),
            data: options.data
        })
        .then(signedTx => client.sendRawTransaction({ serializedTransaction: signedTx }))
}
