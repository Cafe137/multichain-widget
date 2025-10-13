import { SushiResponse } from './SushiResponse'

export async function fetchSushi(amount: string, sender: string, recipient: string) {
    const tokenIn = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' // xDAI
    const tokenOut = '0xdbf3ea6f5bee45c02255b2c26a16f300502f68da' // xBZZ
    const response = await fetch(
        `https://api.sushi.com/swap/v7/100?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amount=${amount}&maxSlippage=0.005&sender=${sender}&recipient=${recipient}&fee=0.0025&feeBy=output&feeReceiver=0xde7259893af7cdbc9fd806c6ba61d22d581d5667&simulate=true`
    )
    const data = await response.json()
    return data as SushiResponse
}
