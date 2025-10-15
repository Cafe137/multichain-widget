import { ReactNode } from 'react'
import { MultichainTheme } from './MultichainTheme'

interface Props {
    theme: MultichainTheme
    children: ReactNode
    small?: boolean
}

export function Typography({ theme, children, small }: Props) {
    return (
        <p
            style={{
                color: theme.textColor,
                fontFamily: theme.fontFamily,
                fontSize: small ? theme.smallFontSize : theme.fontSize,
                fontWeight: small ? theme.smallFontWeight : theme.fontWeight
            }}
            className="multichain__text"
        >
            {children}
        </p>
    )
}
