import { Settings } from '../settings/Settings'
import { RelayQuote, RelayQuoteInput } from './RelayQuote'
import { RelayQuoteParser } from './RelayQuoteParser'

export const RelayAPI = {
    async fetchQuote(input: RelayQuoteInput): Promise<RelayQuote> {
        const response = await fetch('https://api.relay.link/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
            signal: AbortSignal.timeout(Settings.globalTimeout)
        })

        if (!response.ok) {
            throw new Error(`Error fetching quote: ${response.statusText}`)
        }

        const quote = (await response.json()) as unknown

        return RelayQuoteParser.parse(quote)
    }
}
