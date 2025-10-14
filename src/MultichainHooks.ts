import { MultichainErrorWrapper } from './MultichainErrorWrapper'

export interface MultichainHooks {
    beforeTransactionStart: (temporaryPrivateKey: string) => Promise<void>
    onFatalError: (error: MultichainErrorWrapper) => Promise<void>
    onCompletion: () => Promise<void>
}

export function getDefaultHooks(): MultichainHooks {
    return {
        beforeTransactionStart: async (_temporaryPrivateKey: string) => {
            void 0
        },
        onFatalError: async (_error: MultichainErrorWrapper) => {
            void 0
        },
        onCompletion: async () => {
            void 0
        }
    }
}
