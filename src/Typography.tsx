import { ReactNode } from 'react'

interface Props {
    children: ReactNode
}

export function Typography({ children }: Props) {
    return <p className="multichain__text">{children}</p>
}
