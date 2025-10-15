# Flow

1. Cross-swap a token to xDAI using Relay, goes to a temporary wallet.
2. Swap xDAI to xBZZ using SushiSwap, goes to the user's wallet.
3. Transfer any remaining xDAI to the user's wallet.

# Dependencies

## Relay

We use the Relay API to cross-swap to xDAI.

## SushiSwap

We use SushiSwap contracts and its API to swap xDAI to xBZZ.

# Considerations

## Theme

Most styles can be overwritten by passing a `theme` prop to the `MultichainWidget` component.

## Temporary wallet persistence

A backup of every generated private key is stored in `localStorage` with a timestamp suffix to avoid collisions.

## Recoverability

It is OK if the flow errors out or the user navigates away. The app can detect which steps have been completed and resume from there.

## Reactivity

Hooks can be set by passing `hooks` prop to the `MultichainWidget` component. Currently supported hooks are:

-   `beforeTransactionStart`
-   `onFatalError`
-   `onCompletion`

# Known issues / Remaining tasks

## Absolute amounts

The specified xBZZ amount is absolute, not relative. For example, if the user already has 90 xBZZ, they would have to specify 100 xBZZ to receive 10 more.

## No quote available on Relay

This can happen when the amount is too low or too high. May happen more frequently with unpopular tokens.

## SushiSwap transaction failure

This can happen when Gnosis experiences a sudden spike in gas prices.

## xDAI source support

The end user will not receive any quotes if they attempt to use xDAI as the source token. This is because in this case, we attempt to get a quote from xDAI to xDAI.

## Add slippage and fee considerations

The resulting xBZZ and xDAI and currently lower than expected due to fees and slippage. This can never be fully eliminated, and for the MVP a fixed 5% buffer is recommended.

## Network check

The app currently does not check if the user is on the correct network. This leads to failed transactions.

## JSON-RPC provider array

Allow passing an array of JSON-RPC providers to increase reliability.

## Retriable requests

Some requests can fail due to temporary JSON-RPC issues. These should be retried a few times before giving up.

## Gas spike handling

There is an error which is easy to detect: `Details: FeeTooLow, EffectivePriorityFeePerGas too low 0 < 1, BaseFee: 2783571`. This should be handled by retrying the transaction with a higher gas price.

## React version dependency

It seems that the app only works with React 18+. This may not be compatible with Bee Dashboard using React 17 (due to Material UI 4 dependency). It would be best to upgrade Bee Dashboard to React 18 and Material UI 5. React 18 is already 4 years old.
