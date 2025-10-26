import { ReactNode } from 'react'

interface Props {
    children: ReactNode
    gap: string
}

export function Vertical({ children, gap }: Props) {
    return <div style={{ display: 'flex', flexDirection: 'column', gap }}>{children}</div>
}
