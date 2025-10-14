import { ReactNode } from 'react'
import { MultichainTheme } from './MultichainTheme'

interface Props {
    theme: MultichainTheme
    children: ReactNode
}

export function Typography({ theme, children }: Props) {
    return (
        <p style={{ color: theme.textColor }} className="multichain__text">
            {children}
        </p>
    )
}
