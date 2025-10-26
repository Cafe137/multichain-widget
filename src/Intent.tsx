export type Intent = 'initial-funding' | 'postage-batch' | 'arbitrary'

export function getAmountsForIntent(_intent: Intent): { bzzAmount: number; nativeAmount: number } {
    return { bzzAmount: 10, nativeAmount: 0.1 }
}
