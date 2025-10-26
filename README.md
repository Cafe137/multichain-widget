# Getting started

## Installation

```
npm install @upcoming/multichain-widget
```

## Usage

Import the component and accompanying styles:

```ts
import '@rainbow-me/rainbowkit/styles.css'
import { MultichainWidget } from '@upcoming/multichain-widget'
import '@upcoming/multichain-widget/styles.css'
```

Then simply place the component in your app:

```tsx
<MultichainWidget />
```

The props `theme`, `hooks`, `settings` can be passed to customize the widget. To be documented.

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

## No quote available on Relay

This can happen when the amount is too low or too high. May happen more frequently with unpopular tokens.

## xDAI source support

The end user will not receive any quotes if they attempt to use xDAI as the source token. This is because in this case, we attempt to get a quote from xDAI to xDAI.

## React version dependency

It seems that the app only works with React 18+. This may not be compatible with Bee Dashboard using React 17 (due to Material UI 4 dependency). It would be best to upgrade Bee Dashboard to React 18 and Material UI 5. React 18 is already 4 years old.
