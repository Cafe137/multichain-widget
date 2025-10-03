import { useState } from 'react'
import './App.css'
import { Tab1 } from './Tab1'
import { Tab2 } from './Tab2'

export function App() {
    const [tab, setTab] = useState<1 | 2>(1)

    if (tab === 1) {
        return <Tab1 setTab={setTab} />
    }

    return <Tab2 setTab={setTab} />
}
