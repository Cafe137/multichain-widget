import { MultichainSubstep } from './MultichainStep'

export interface MultichainErrorWrapper {
    step: MultichainSubstep
    error: any
}
