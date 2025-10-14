import { Dates } from 'cafe-utility'

interface TokenPriceResponse {
    price: number
}

export async function getTokenPrice(tokenAddress: `0x${string}`, chainId: number): Promise<number> {
    const response = await fetch(
        `https://api.relay.link/currencies/token/price?address=${tokenAddress}&chainId=${chainId}`,
        { signal: AbortSignal.timeout(Dates.seconds(10)) }
    )
    const data = (await response.json()) as TokenPriceResponse
    return data.price
}

export async function getGnosisBzzTokenPrice(): Promise<number> {
    return getTokenPrice('0xdbf3ea6f5bee45c02255b2c26a16f300502f68da', 100)
}
