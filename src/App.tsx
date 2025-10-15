import { darkTheme, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { convertViemChainToRelayChain, createClient, MAINNET_RELAY_API } from '@relayprotocol/relay-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MultichainLibrary, MultichainLibrarySettings } from '@upcoming/multichain-library'
import { Objects } from 'cafe-utility'
import { arbitrum, base, gnosis, mainnet, optimism, polygon } from 'viem/chains'
import { WagmiProvider } from 'wagmi'
import './App.css'
import { getDefaultHooks, MultichainHooks } from './MultichainHooks'
import { getDefaultMultichainTheme, MultichainTheme } from './MultichainTheme'
import { Router } from './Router'

const config = getDefaultConfig({
    appName: 'Multichain Library',
    projectId: '5119e426ef93d637395e119c5169ad79',
    chains: [mainnet, polygon, optimism, arbitrum, base, gnosis],
    ssr: false
})

const queryClient = new QueryClient()

interface Props {
    theme?: Partial<MultichainTheme>
    hooks?: Partial<MultichainHooks>
    settings?: Partial<MultichainLibrarySettings>
}

createClient({
    baseApiUrl: MAINNET_RELAY_API,
    chains: [convertViemChainToRelayChain(mainnet)]
})

export function App({ theme, hooks, settings }: Props) {
    const mergedTheme = Objects.deepMerge2(getDefaultMultichainTheme(), theme || {})
    const mergedHooks = Objects.deepMerge2(getDefaultHooks(), hooks || {})
    const library = new MultichainLibrary(settings)

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()}>
                    <Router theme={mergedTheme} hooks={mergedHooks} library={library} />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
