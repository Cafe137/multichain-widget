export interface RelayQuote {
    steps: RelayQuoteStep[]
    fees: RelayQuoteFees
    details: RelayQuoteDetails
}

export interface RelayQuoteInput {
    user: '0x742d35Cc6634C0532925a3b8D9d4DB0a2D7DD5B3'
    originChainId: 1
    destinationChainId: 8453
    originCurrency: '0x0000000000000000000000000000000000000000'
    destinationCurrency: '0x0000000000000000000000000000000000000000'
    amount: '100000000000000000'
    tradeType: 'EXACT_INPUT'
}

export interface RelayQuoteStep {
    id: 'deposit'
    action: 'Confirm transaction in your wallet'
    description: 'Deposit funds for executing the bridge'
    kind: 'transaction'
    requestId: '0x92b99e6e1ee1deeb9531b5ad7f87091b3d71254b3176de9e8b5f6c6d0bd3a331'
    items: RelayQuoteStepItem[]
}

export interface RelayQuoteStepItem {
    status: 'incomplete'
    data: RelayQuoteStepItemData
    check: RelayQuoteStepItemCheck
}

export interface RelayQuoteStepItemData {
    from: '0x742d35Cc6634C0532925a3b8D9d4DB0a2D7DD5B3'
    to: '0xf70da97812cb96acdf810712aa562db8dfa3dbef'
    data: '0x00fad611'
    value: '100000000000000000'
    chainId: 1
}

export interface RelayQuoteStepItemCheck {
    endpoint: '/intents/status?requestId=0x92b99e6e1ee1deeb9531b5ad7f87091b3d71254b3176de9e8b5f6c6d0bd3a331'
    method: 'GET'
}

export interface RelayQuoteFees {
    gas: CurrencyAmount
    relayer: CurrencyAmount
}

export interface RelayQuoteDetails {
    operation: 'bridge'
    timeEstimate: 30
    currencyIn: DetailedCurrencyAmount
    currencyOut: DetailedCurrencyAmount
}

export interface CurrencyAmount {
    amount: '21000000000000000'
    currency: 'eth'
}

export interface DetailedCurrencyAmount {
    currency: Currency
    amount: string
}

export interface Currency {
    chainId: 1
    address: '0x0000000000000000000000000000000000000000'
    symbol: 'ETH'
    name: 'Ethereum'
    decimals: 18
}
