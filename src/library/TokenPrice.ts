import { Constants } from './Constants'
import { Settings } from './Settings'

interface TokenPriceResponse {
    price: number
}

export async function getTokenPrice(tokenAddress: `0x${string}`, chainId: number): Promise<number> {
    const response = await fetch(
        `https://api.relay.link/currencies/token/price?address=${tokenAddress}&chainId=${chainId}`,
        { signal: AbortSignal.timeout(Settings.fetchTimeout) }
    )
    const data = (await response.json()) as TokenPriceResponse
    return data.price
}

export async function getGnosisBzzTokenPrice(): Promise<number> {
    return getTokenPrice(Constants.bzzGnosisAddress, Constants.gnosisChainId)
}
