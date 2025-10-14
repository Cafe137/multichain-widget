import { Dates, Types } from 'cafe-utility'

export async function getGnosisTransactionCount(address: string): Promise<number> {
    address = address.toLowerCase()
    if (address.startsWith('0x')) {
        address = address.slice(2)
    }
    const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionCount',
        params: [`0x${address}`, 'latest']
    }
    const response = await fetch('https://rpc.gnosischain.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(Dates.seconds(10))
    })
    const data = await response.json()
    const object = Types.asObject(data)
    const count = Types.asHexString(object.result, { strictPrefix: true, uneven: true })
    return parseInt(count, 16)
}
