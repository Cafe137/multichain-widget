export interface MultichainErrorWrapper {
    step: 'relay' | 'sushi' | 'transfer'
    error: any
}
