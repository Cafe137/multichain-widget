interface SushiToken {
    address: `0x${string}`
    symbol: string
    name: string
    decimals: number
}

interface SushiTx {
    from: `0x${string}`
    to: `0x${string}`
    gas: string
    gasPrice: number
    data: `0x${string}`
    value: string
}

export interface SushiResponse {
    status: 'Success' | string
    tokens: SushiToken[]
    tokenFrom: number
    tokenTo: number
    swapPrice: number
    priceImpact: number
    amountIn: string
    assumedAmountOut: string
    gasSpent: number
    tx: SushiTx
}
