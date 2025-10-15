import { MultichainStepStatus } from './MultichainStep'
import { MultichainTheme } from './MultichainTheme'
import { Typography } from './Typography'

interface Props {
    theme: MultichainTheme
    children: string
    status: MultichainStepStatus
}

export function ProgressStatus({ theme, children, status }: Props) {
    let symbol = '...'
    if (status === 'skipped') {
        symbol = '⏭️'
    }
    if (status === 'done') {
        symbol = '✅'
    }
    if (status === 'in-progress') {
        symbol = '🔄'
    }
    if (status === 'error') {
        symbol = '❌'
    }
    if (status === 'pending') {
        symbol = '...'
    }

    return (
        <Typography theme={theme} small>
            {symbol} {children}
        </Typography>
    )
}
