import { Dates, FixedPointNumber, Types } from 'cafe-utility'

export async function getGnosisNativeBalance(address: `0x${string}`): Promise<FixedPointNumber> {
    const payload = { jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] }
    const response = await fetch('https://rpc.gnosischain.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(Dates.seconds(10))
    })
    const data = await response.json()
    const object = Types.asObject(data)
    const price = Types.asHexString(object.result, { strictPrefix: true, uneven: true })
    return new FixedPointNumber(BigInt(price), 18)
}
