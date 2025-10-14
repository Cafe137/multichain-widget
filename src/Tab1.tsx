import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Types } from 'cafe-utility'
import { Dispatch, SetStateAction } from 'react'
import { useAccount } from 'wagmi'
import { Button } from './Button'
import { LabelSpacing } from './LabelSpacing'
import { MultichainTheme } from './MultichainTheme'
import { NumberInput } from './NumberInput'
import { SwapData } from './SwapData'
import { TextInput } from './TextInput'
import { Typography } from './Typography'

interface Props {
    theme: MultichainTheme
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
    setSwapData: Dispatch<SetStateAction<SwapData>>
}

export function Tab1({ theme, setTab, swapData, setSwapData }: Props) {
    const { address } = useAccount()

    function onConnect() {
        if (address && swapData.targetAddress) {
            setSwapData(x => ({ ...x, sourceAddress: Types.asHexString(address) }))
            setTab(2)
        }
    }

    return (
        <div className="page">
            <div
                className="multichain__wrapper"
                style={{ borderRadius: theme.borderRadius, backgroundColor: theme.backgroundColor }}
            >
                <div className="multichain__row">
                    <svg width="80" height="80" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="256" cy="256" r="200" fill="#0074D9" stroke="#0074D9" strokeWidth="20" />
                        <circle cx="256" cy="160" r="20" fill="white" stroke="white" strokeWidth="20" />
                        <path
                            d="M 221 226 l 30 0 l 0 30 l -30 0 z"
                            stroke="white"
                            strokeWidth="20"
                            fill="white"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M 241 226 l 30 0 l 0 130 l -30 0 z"
                            stroke="white"
                            strokeWidth="20"
                            fill="white"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M 271 326 l 30 0 l 0 30 l -30 0 z"
                            stroke="white"
                            strokeWidth="20"
                            fill="white"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <Typography theme={theme}>
                        Your Bee node needs an initial funding on the Gnosis chain to start. You'll receive xDAI for
                        transaction gas fees and xBZZ tokens for the storage and bandwidth costs.
                    </Typography>
                </div>
                <LabelSpacing theme={theme}>
                    <Typography theme={theme}>Target Address</Typography>
                    <TextInput
                        theme={theme}
                        placeholder="0x..."
                        value={swapData.targetAddress}
                        onChange={e => setSwapData(x => ({ ...x, targetAddress: e }))}
                    />
                </LabelSpacing>
                <div className="multichain__row">
                    <div className="multichain__column multichain__column--full">
                        <LabelSpacing theme={theme}>
                            <Typography theme={theme}>xDAI</Typography>
                            <NumberInput
                                theme={theme}
                                placeholder="0.0"
                                step={0.1}
                                max={10}
                                min={0}
                                value={swapData.nativeAmount}
                                onChange={e => setSwapData(x => ({ ...x, nativeAmount: e }))}
                            />
                        </LabelSpacing>
                    </div>
                    <div className="multichain__column multichain__column--full">
                        <LabelSpacing theme={theme}>
                            <Typography theme={theme}>xBZZ</Typography>
                            <NumberInput
                                theme={theme}
                                step={0.1}
                                max={1000}
                                min={0}
                                value={swapData.bzzAmount}
                                onChange={e => setSwapData(x => ({ ...x, bzzAmount: Number(e) }))}
                            />
                        </LabelSpacing>
                    </div>
                </div>
                <ConnectButton />
                <Button theme={theme} onClick={onConnect} disabled={!address || !swapData.targetAddress}>
                    Continue
                </Button>
            </div>
        </div>
    )
}
