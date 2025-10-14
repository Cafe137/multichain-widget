interface TokenPriceResponse {
    price: number
}

export async function fetchTokenPrice(tokenAddress: `0x${string}`, chainId: number): Promise<number> {
    const response = await fetch(
        `https://api.relay.link/currencies/token/price?address=${tokenAddress}&chainId=${chainId}`
    )
    const data = (await response.json()) as TokenPriceResponse
    return data.price
}

export async function fetchGnosisBzzTokenPrice(): Promise<number> {
    return fetchTokenPrice('0xdbf3ea6f5bee45c02255b2c26a16f300502f68da', 100)
}
