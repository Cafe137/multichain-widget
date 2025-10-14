import { Numbers } from 'cafe-utility'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { gnosis } from 'viem/chains'
import { Constants } from './Constants'
import { getGnosisTransactionCount } from './GnosisTransactionCount'
import { Settings } from './Settings'

interface Options {
    amount: string | bigint
    originPrivateKey: `0x${string}`
    originAddress: `0x${string}`
    to: `0x${string}`
}

export async function transferGnosisNative(options: Options): Promise<`0x${string}`> {
    const account = privateKeyToAccount(options.originPrivateKey)
    const client = createWalletClient({
        chain: gnosis,
        transport: http(Settings.gnosisJsonRpc)
    })
    return account
        .signTransaction({
            chain: Constants.gnosisChainId,
            chainId: Constants.gnosisChainId,
            account: options.originAddress,
            gas: BigInt(21000),
            gasPrice: BigInt(Numbers.make('1 gwei')),
            type: 'legacy',
            to: options.to,
            value: BigInt(options.amount),
            nonce: await getGnosisTransactionCount(options.originAddress)
        })
        .then(signedTx => client.sendRawTransaction({ serializedTransaction: signedTx }))
}
