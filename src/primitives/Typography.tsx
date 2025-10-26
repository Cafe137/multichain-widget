import { ReactNode } from 'react'
import { MultichainTheme } from '../MultichainTheme'

interface Props {
    theme: MultichainTheme
    children: ReactNode
    small?: boolean
    secondary?: boolean
}

export function Typography({ theme, children, small, secondary }: Props) {
    return (
        <p
            style={{
                color: secondary ? theme.secondaryTextColor : theme.textColor,
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
