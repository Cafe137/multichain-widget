import { FixedPointNumber, Types } from 'cafe-utility'
import { Settings } from './Settings'

export async function getGnosisNativeBalance(address: `0x${string}`): Promise<FixedPointNumber> {
    const payload = { jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] }
    const response = await fetch(Settings.gnosisJsonRpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(Settings.fetchTimeout)
    })
    const data = await response.json()
    const object = Types.asObject(data)
    const price = Types.asHexString(object.result, { strictPrefix: true, uneven: true })
    return new FixedPointNumber(BigInt(price), 18)
}
