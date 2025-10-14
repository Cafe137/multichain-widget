import { FixedPointNumber } from 'cafe-utility'

interface JsonRpcResponse {
    jsonrpc: string
    result: `0x${string}`
    id: number
}

export async function fetchGnosisNativeBalance(address: `0x${string}`): Promise<FixedPointNumber> {
    const payload = { jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] }
    const response = await fetch('https://rpc.gnosischain.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    const data = (await response.json()) as JsonRpcResponse
    return new FixedPointNumber(BigInt(data.result), 18)
}
