import { Constants } from './Constants'
import { Settings } from './Settings'

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

export async function getSushiSwapQuote(amount: string, sender: string, recipient: string) {
    const tokenIn = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' // xDAI
    const tokenOut = Constants.bzzGnosisAddress
    const response = await fetch(
        `https://api.sushi.com/swap/v7/100?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amount=${amount}&maxSlippage=0.005&sender=${sender}&recipient=${recipient}&fee=0.0025&feeBy=output&feeReceiver=0xde7259893af7cdbc9fd806c6ba61d22d581d5667&simulate=true`,
        { signal: AbortSignal.timeout(Settings.fetchTimeout) }
    )
    const data = await response.json()
    return data as SushiResponse
}
