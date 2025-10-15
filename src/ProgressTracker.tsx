import { LabelSpacing } from './LabelSpacing'
import { MultichainProgress } from './MultichainStep'
import { MultichainTheme } from './MultichainTheme'
import { ProgressStatus } from './ProgressStatus'

interface Props {
    theme: MultichainTheme
    progress: MultichainProgress
}

export function ProgressTracker({ theme, progress }: Props) {
    return (
        <LabelSpacing theme={theme}>
            <ProgressStatus theme={theme} status={progress.relay}>
                Cross-swap to xDAI on Relay
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['relay-sync']}>
                Sync
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress.sushi}>
                Swap xDAI to xBZZ on Sushi
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['sushi-sync']}>
                Sync
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress.transfer}>
                Transfer leftover xDAI
            </ProgressStatus>
            <ProgressStatus theme={theme} status={progress['transfer-sync']}>
                Sync
            </ProgressStatus>
        </LabelSpacing>
    )
}
