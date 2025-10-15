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
        onFatalError: async (error: MultichainErrorWrapper) => {
            console.error('A fatal error occurred during the multichain transaction:', error)
        },
        onCompletion: async () => {
            console.log('Multichain transaction completed successfully!')
        }
    }
}
