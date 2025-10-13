import { ReactNode } from 'react'
import { MultichainTheme } from './Theme'
import { Vertical } from './Vertical'

interface Props {
    theme: MultichainTheme
    children: ReactNode
}

export function LabelSpacing({ theme, children }: Props) {
    return <Vertical gap={theme.labelSpacing}>{children}</Vertical>
}
