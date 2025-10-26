# Installation

```
npm install @upcoming/multichain-widget
```

# Usage

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

## Props and Query params

It is possible to specify query params or pass some props to `<MultichainWidget />` to customize its behavior:

### `theme`

Colors, fonts, sizes, etc. can be overwritten by using this prop.

Does not support query params.

### `hooks`

Callbacks can be specified for various events in the flow. The most important hook is the `onCompletion` hook, which is called when the flow is completed successfully.

Applications embedding the widget and conditionally rendering it can use this hook to unmount the widget when the flow is done.

Does not support query params.

### `settings`

Mainly used to customize the `gnosisJsonRpcProviders` array.

Does not support query params.

### `intent`

The intent modifies the information text displayed on the first screen. Possible values are `initial-funding`, `postage-batch` and `arbitrary`.

Can be specified in the query params with the `intent` key.

### `destination`

The default target address where the xBZZ and xDAI tokens will be sent.

Can be specified in the query params with the `destination` key.

### `dai`

The default amount of xDAI to receive at the end of the flow.

Can be specified in the query params with the `dai` key.

### `bzz`

The default amount of xBZZ to receive at the end of the flow.

Can be specified in the query params with the `bzz` key.

# Flow

1. Cross-swap a token to xDAI using Relay, goes to a temporary wallet.
2. Swap xDAI to xBZZ using SushiSwap, goes to the user's wallet.
3. Transfer any remaining xDAI to the user's wallet.

# Dependencies

### Relay

We use the Relay API to cross-swap to xDAI.

### SushiSwap

We use SushiSwap contracts and its API to swap xDAI to xBZZ.

# Considerations

## Theme

Most styles can be overwritten by passing a `theme` prop to the `MultichainWidget` component.

## Temporary wallet persistence

A backup of every generated private key is stored in `localStorage` with a timestamp suffix to avoid collisions.

## Recoverability

~~It is OK if the flow errors out or the user navigates away. The app can detect which steps have been completed and resume from there.~~

This one is still under investigation. By having absolute amounts for xDAI and xBZZ initially, this used to work, but for the ideal UX we switched to relative amounts. This makes it much harder to guess whether there was a flow interruption or not.

## Reactivity

Hooks can be set by passing `hooks` prop to the `MultichainWidget` component. Currently supported hooks are:

-   `beforeTransactionStart`
-   `onFatalError`
-   `onCompletion`

# Known issues / Remaining tasks

## React version dependency

It seems that the app only works with React 18+. This may not be compatible with Bee Dashboard using React 17 (due to Material UI 4 dependency). It would be best to upgrade Bee Dashboard to React 18 and Material UI 5. React 18 is already 4 years old.
