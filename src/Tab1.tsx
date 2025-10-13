import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Dispatch, SetStateAction } from 'react'
import { useAccount } from 'wagmi'
import { Button } from './Button'
import { NumberInput } from './NumberInput'
import { SwapData } from './SwapData'
import { TextInput } from './TextInput'
import { MultichainTheme } from './Theme'
import { Typography } from './Typography'
import { prefix } from './Utility'

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
            setSwapData(x => ({ ...x, sourceAddress: prefix(address) }))
            setTab(2)
        }
    }

    return (
        <div className="page">
            <div
                className="multichain__wrapper"
                style={{ borderRadius: theme.borderRadius, backgroundColor: theme.backgroundColor }}
            >
                <Typography theme={theme}>Initial node funding</Typography>
                <Typography theme={theme}>
                    Your Bee node needs initial funding to start. You'll receive xDAI for gas fees and xBZZ tokens to
                    upload and for bandwidth costs.
                </Typography>
                <Typography theme={theme}>Target Address</Typography>
                <TextInput
                    theme={theme}
                    placeholder="0x..."
                    value={swapData.targetAddress}
                    onChange={e => setSwapData(x => ({ ...x, targetAddress: e }))}
                />
                <div className="multichain__row">
                    <div className="multichain__column multichain__column--full">
                        <Typography theme={theme}>xDAI Amount</Typography>
                        <NumberInput
                            theme={theme}
                            placeholder="0.0"
                            step={0.1}
                            max={10}
                            min={0}
                            value={swapData.nativeAmount}
                            onChange={e => setSwapData(x => ({ ...x, nativeAmount: e }))}
                        />
                    </div>
                    <div className="multichain__column multichain__column--full">
                        <Typography theme={theme}>xBZZ Amount</Typography>
                        <NumberInput
                            theme={theme}
                            step={0.1}
                            max={1000}
                            min={0}
                            value={swapData.bzzAmount}
                            onChange={e => setSwapData(x => ({ ...x, bzzAmount: Number(e) }))}
                        />
                    </div>
                </div>
                <div className="multichain__row">
                    <ConnectButton />
                </div>
                <Button theme={theme} onClick={onConnect} disabled={!address || !swapData.targetAddress}>
                    {address ? 'Continue' : 'Connect Wallet'}
                </Button>
            </div>
        </div>
    )
}
