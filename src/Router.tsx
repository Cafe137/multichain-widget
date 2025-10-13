import { useState } from 'react'
import { Tab1 } from './Tab1'
import { Tab2 } from './Tab2'
import { MultichainTheme } from './Theme'

interface Props {
    theme: MultichainTheme
}

export function Router({ theme }: Props) {
    const url = new URL(window.location.href)
    const destination = url.searchParams.get('destination')

    const [swapData, setSwapData] = useState({
        bzzAmount: 10,
        nativeAmount: 1,
        sourceAddress: '',
        targetAddress: destination ?? ''
    })
    const [tab, setTab] = useState<1 | 2>(1)

    if (tab === 1) {
        return <Tab1 setTab={setTab} theme={theme} swapData={swapData} setSwapData={setSwapData} />
    }

    return <Tab2 setTab={setTab} theme={theme} swapData={swapData} />
}
