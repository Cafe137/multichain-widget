import { Dates, FixedPointNumber, Types } from 'cafe-utility'

export async function getGnosisBzzBalance(address: string): Promise<FixedPointNumber> {
    address = address.toLowerCase()
    if (address.startsWith('0x')) {
        address = address.slice(2)
    }
    const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [
            {
                from: '0x0000000000000000000000000000000000000000',
                data: `0x70a08231000000000000000000000000${address}`,
                to: '0xdbf3ea6f5bee45c02255b2c26a16f300502f68da'
            },
            'latest'
        ]
    }
    const response = await fetch('https://rpc.gnosischain.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(Dates.seconds(10))
    })
    const data = await response.json()
    const object = Types.asObject(data)
    const balance = Types.asHexString(object.result, { strictPrefix: true, uneven: true })
    return new FixedPointNumber(BigInt(balance), 16)
}
