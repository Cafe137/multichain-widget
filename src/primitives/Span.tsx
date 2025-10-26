import { ReactNode } from 'react'
import { MultichainTheme } from '../MultichainTheme'

interface Props {
    theme: MultichainTheme
    children: ReactNode
    color?: string
}

export function Span({ theme, children, color }: Props) {
    return (
        <span
            style={{
                color: color ?? theme.textColor,
                fontFamily: theme.fontFamily,
                fontSize: theme.fontSize,
                fontWeight: theme.fontWeight
            }}
            className="multichain__text"
        >
            {children}
        </span>
    )
}
