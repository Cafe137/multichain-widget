import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Dispatch, SetStateAction } from 'react'
import { useAccount } from 'wagmi'
import { SwapData } from './SwapData'
import { MultichainTheme } from './Theme'
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
            setSwapData(x => ({ ...x, sourceAddress: address }))
            setTab(2)
        }
    }

    return (
        <div className="page">
            <div className="multichain__wrapper">
                <Typography>Initial node funding</Typography>
                <Typography>
                    Your Bee node needs initial funding to start. You'll receive xDAI for gas fees and xBZZ tokens to
                    upload and for bandwidth costs.
                </Typography>
                <label>Target Address</label>
                <input
                    type="text"
                    placeholder="0x..."
                    value={swapData.targetAddress}
                    onChange={e => setSwapData(x => ({ ...x, targetAddress: e.target.value }))}
                />
                <div className="multichain__row">
                    <div className="multichain__column multichain__column--full">
                        <label>xDAI Amount</label>
                        <input
                            type="number"
                            placeholder="0.0"
                            step={0.1}
                            max={10}
                            min={0}
                            value={swapData.nativeAmount}
                            onChange={e => setSwapData(x => ({ ...x, nativeAmount: Number(e.target.value) }))}
                        />
                    </div>
                    <div className="multichain__column multichain__column--full">
                        <label>xBZZ Amount</label>
                        <input
                            type="number"
                            step={0.1}
                            max={1000}
                            min={0}
                            value={swapData.bzzAmount}
                            onChange={e => setSwapData(x => ({ ...x, bzzAmount: Number(e.target.value) }))}
                        />
                    </div>
                </div>
                <div className="multichain__row">
                    <ConnectButton />
                </div>
                <button
                    className="multichain__button"
                    onClick={onConnect}
                    disabled={!address || !swapData.targetAddress}
                >
                    {address ? 'Continue' : 'Connect Wallet'}
                </button>
            </div>
        </div>
    )
}
