import { Binary, Elliptic, Strings } from 'cafe-utility'
import { useState } from 'react'
import { SwapData } from './SwapData'
import { Tab1 } from './Tab1'
import { Tab2 } from './Tab2'
import { MultichainTheme } from './Theme'
import { prefix } from './Utility'

const LOCAL_STORAGE_KEY = 'multichain-session-key'

interface Props {
    theme: MultichainTheme
}

export function Router({ theme }: Props) {
    const url = new URL(window.location.href)
    const destination = url.searchParams.get('destination')
    const sessionKey = prefix(localStorage.getItem(LOCAL_STORAGE_KEY) || Strings.randomHex(64))
    if (localStorage.getItem(LOCAL_STORAGE_KEY) !== sessionKey) {
        localStorage.setItem(LOCAL_STORAGE_KEY, sessionKey)
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${Date.now()}`, sessionKey)
    }

    const [swapData, setSwapData] = useState<SwapData>({
        bzzAmount: 3,
        nativeAmount: 0.2,
        sourceAddress: '',
        targetAddress: destination ? prefix(destination) : '',
        sessionKey,
        temporaryAddress: prefix(
            Binary.uint8ArrayToHex(
                Elliptic.publicKeyToAddress(
                    Elliptic.privateKeyToPublicKey(Binary.uint256ToNumber(Binary.hexToUint8Array(sessionKey), 'BE'))
                )
            )
        )
    })
    const [tab, setTab] = useState<1 | 2>(1)

    if (tab === 1) {
        return <Tab1 setTab={setTab} theme={theme} swapData={swapData} setSwapData={setSwapData} />
    }

    return <Tab2 setTab={setTab} theme={theme} swapData={swapData} />
}
