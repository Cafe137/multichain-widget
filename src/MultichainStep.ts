export type MultichainStep = 'relay' | 'sushi' | 'transfer' | 'done'
export type MultichainSubstep = 'relay' | 'relay-sync' | 'sushi' | 'sushi-sync' | 'transfer' | 'transfer-sync' | 'done'
export type MultichainStepStatus = 'pending' | 'in-progress' | 'done' | 'error' | 'skipped'
export type MultichainProgress = Record<MultichainSubstep, MultichainStepStatus>
