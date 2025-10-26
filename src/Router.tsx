import { MultichainLibrary } from '@upcoming/multichain-library'
import { Binary, Elliptic, Strings, Types } from 'cafe-utility'
import { useState } from 'react'
import { getAmountsForIntent, Intent } from './Intent'
import { MultichainHooks } from './MultichainHooks'
import { MultichainTheme } from './MultichainTheme'
import { SwapData } from './SwapData'
import { Tab1 } from './Tab1'
import { Tab2 } from './Tab2'

const LOCAL_STORAGE_KEY = 'multichain-session-key'

interface Props {
    theme: MultichainTheme
    hooks: MultichainHooks
    library: MultichainLibrary
    intent?: Intent
}

export function Router({ theme, hooks, library, intent }: Props) {
    const url = new URL(window.location.href)
    const destination = url.searchParams.get('destination')
    const queryParamIntent = url.searchParams.get('intent')
    const resolvedIntent: Intent = intent
        ? intent
        : queryParamIntent === 'initial-funding'
        ? 'initial-funding'
        : queryParamIntent === 'postage-batch'
        ? 'postage-batch'
        : 'arbitrary'

    const sessionKey = Types.asHexString(localStorage.getItem(LOCAL_STORAGE_KEY) || Strings.randomHex(64))
    if (localStorage.getItem(LOCAL_STORAGE_KEY) !== sessionKey) {
        localStorage.setItem(LOCAL_STORAGE_KEY, sessionKey)
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${Date.now()}`, sessionKey)
    }

    const [swapData, setSwapData] = useState<SwapData>({
        ...getAmountsForIntent(resolvedIntent),
        sourceAddress: '',
        targetAddress: destination ? Types.asHexString(destination) : '',
        sessionKey,
        temporaryAddress: Types.asHexString(
            Binary.uint8ArrayToHex(
                Elliptic.publicKeyToAddress(
                    Elliptic.privateKeyToPublicKey(Binary.uint256ToNumber(Binary.hexToUint8Array(sessionKey), 'BE'))
                )
            )
        )
    })
    const [tab, setTab] = useState<1 | 2>(1)
    const [initialChainId, setInitialChainId] = useState<number | null>(null)

    if (tab === 1 || initialChainId === null) {
        return (
            <Tab1
                setTab={setTab}
                theme={theme}
                intent={resolvedIntent}
                swapData={swapData}
                setSwapData={setSwapData}
                setInitialChainId={setInitialChainId}
            />
        )
    }

    return (
        <Tab2
            setTab={setTab}
            theme={theme}
            hooks={hooks}
            swapData={swapData}
            initialChainId={initialChainId}
            library={library}
        />
    )
}
