import { Typography } from './Typography'

interface Props {
    setTab: (tab: 1 | 2) => void
}

export function Tab1({ setTab }: Props) {
    function onConnect() {
        setTab(2)
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
                <input type="text" placeholder="0x..." />
                <div className="multichain__row">
                    <div className="multichain__column multichain__column--full">
                        <label>xDAI Amount</label>
                        <input type="text" placeholder="0.0" />
                    </div>
                    <div className="multichain__column multichain__column--full">
                        <label>xBZZ Amount</label>
                        <input type="text" placeholder="0.0" />
                    </div>
                </div>
                <button onClick={onConnect}>Connect Wallet to Continue</button>
            </div>
        </div>
    )
}
