import { darkTheme, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { convertViemChainToRelayChain, createClient, MAINNET_RELAY_API } from '@relayprotocol/relay-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Objects } from 'cafe-utility'
import { arbitrum, base, gnosis, mainnet, optimism, polygon } from 'viem/chains'
import { WagmiProvider } from 'wagmi'
import './App.css'
import { Router } from './Router'
import { getDefaultMultichainTheme, MultichainTheme } from './Theme'

const config = getDefaultConfig({
    appName: 'Multichain Library',
    projectId: '5119e426ef93d637395e119c5169ad79',
    chains: [mainnet, polygon, optimism, arbitrum, base, gnosis],
    ssr: false
})

const queryClient = new QueryClient()

interface Props {
    theme?: MultichainTheme
}

createClient({
    baseApiUrl: MAINNET_RELAY_API,
    chains: [convertViemChainToRelayChain(mainnet)]
})

export function App({ theme }: Props) {
    const mergedTheme = Objects.deepMerge2(getDefaultMultichainTheme(), theme || {})

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()}>
                    <Router theme={mergedTheme} />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
