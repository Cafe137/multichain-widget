export interface MultichainErrorWrapper {
    step: 'relay' | 'sushi-request' | 'sushi-transaction' | 'transfer'
    error: Error
}
