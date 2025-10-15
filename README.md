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

Most styles can be overwritten by passing a `theme` prop to the `App` component.

## Temporary wallet persistence

A backup of every generated private key is stored in `localStorage` with a timestamp suffix to avoid collisions.

## Recoverability

In `Tab2.tsx`, the `onSwap` function attempts to detect the current step and continue from there.

## Reactivity

Hooks can be set by passing `hooks` prop to the `App` component. Currently supported hooks are:

-   `beforeTransactionStart`
-   `onFatalError`
-   `onCompletion`

# Known issues

## No quote available on Relay

This can happen when the amount is too low or too high. May happen more frequently with unpopular tokens.

## SushiSwap transaction failure

This can happen when Gnosis experiences a sudden spike in gas prices.

# Remaining tasks

## xDAI source support

The end user will not receive any quotes if they attempt to use xDAI as the source token. This is because in this case, we attempt to get a quote from xDAI to xDAI.

## Separate library

The `library` folder should be published as a separate package.
