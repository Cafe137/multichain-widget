import { RelayQuote } from './RelayQuote'

export const RelayQuoteParser = {
    parse(raw: any): RelayQuote {
        // TODO: Add validation logic here
        return raw as RelayQuote
    }
}
