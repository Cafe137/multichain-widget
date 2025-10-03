import { Typography } from './Typography'

interface Props {
    setTab: (tab: 1 | 2) => void
}

export function Tab2({ setTab }: Props) {
    function onSwap() {
        setTab(1)
    }

    return (
        <div className="page">
            <div className="multichain__wrapper">
                <label>Source Address</label>
                <input readOnly value="0x1234...abcd" />
                <label>Source Chain</label>
                <select>
                    <option>Gnosis Chain</option>
                    <option>Ethereum</option>
                    <option>Polygon</option>
                </select>
                <label>Source Token</label>
                <select>
                    <option>xDAI</option>
                    <option>ETH</option>
                    <option>MATIC</option>
                </select>
                <Typography>Transaction summary</Typography>
                <Typography>You will swap ETH from Ethereum to fund:</Typography>
                <ul>
                    <li>0.5 xDAI (~$0.5)</li>
                    <li>0.5 xBZZ (~$0.1)</li>
                    <li>
                        <strong>Total: ~$0.6</strong>
                    </li>
                </ul>
                <label>Target Address</label>
                <input readOnly value="0x1234...abcd" />
                <button onClick={onSwap}>Fund Node Wallet</button>
            </div>
        </div>
    )
}
