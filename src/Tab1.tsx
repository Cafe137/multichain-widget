import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Types } from 'cafe-utility'
import { Dispatch, SetStateAction } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { Button } from './Button'
import { Intent } from './Intent'
import { IntentInfo } from './IntentInfo'
import { LabelSpacing } from './LabelSpacing'
import { MultichainTheme } from './MultichainTheme'
import { NumberInput } from './NumberInput'
import { Span } from './Span'
import { SwapData } from './SwapData'
import { TextInput } from './TextInput'
import { Typography } from './Typography'

interface Props {
    theme: MultichainTheme
    intent: Intent
    setTab: (tab: 1 | 2) => void
    swapData: SwapData
    setSwapData: Dispatch<SetStateAction<SwapData>>
    setInitialChainId: Dispatch<SetStateAction<number | null>>
}

export function Tab1({ theme, intent, setTab, swapData, setSwapData, setInitialChainId }: Props) {
    const { address } = useAccount()
    const chainId = useChainId()

    function onConnect() {
        if (address && swapData.targetAddress) {
            if (!chainId) {
                alert('Cannot detect connected chain ID.')
                return
            }
            setSwapData(x => ({ ...x, sourceAddress: Types.asHexString(address) }))
            setInitialChainId(chainId)
            setTab(2)
        }
    }

    return (
        <div
            className="multichain__wrapper"
            style={{ borderRadius: theme.borderRadius, backgroundColor: theme.backgroundColor }}
        >
            <IntentInfo theme={theme} intent={intent} />
            <LabelSpacing theme={theme}>
                <Typography theme={theme}>
                    Target Address
                    <Span theme={theme} color={theme.buttonBackgroundColor}>
                        *
                    </Span>
                </Typography>
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
                        <Typography theme={theme}>
                            xDAI
                            <Span theme={theme} color={theme.buttonBackgroundColor}>
                                *
                            </Span>
                        </Typography>
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
                        <Typography theme={theme}>
                            xBZZ
                            <Span theme={theme} color={theme.buttonBackgroundColor}>
                                *
                            </Span>
                        </Typography>
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
    )
}
