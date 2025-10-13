import { ReactNode } from 'react'
import { MultichainTheme } from './Theme'

interface Props {
    theme: MultichainTheme
    onClick: () => void
    disabled?: boolean
    children: ReactNode
    secondary?: boolean
}

export function Button({ theme, onClick, disabled, children, secondary }: Props) {
    const classList = ['multichain__button']

    if (secondary) {
        classList.push('multichain__button--secondary')
    }

    return (
        <button
            className={classList.join(' ')}
            style={{ borderRadius: theme.borderRadius }}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    )
}
