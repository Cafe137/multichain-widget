# Theme

Most styles can be overwritten by passing a `theme` prop to the `App` component.

# Temporary wallet persistence

A backup of every generated private key is stored in `localStorage` with a timestamp suffix to avoid collisions.

# Recoverability

In `Tab2.tsx`, the `onSwap` function attempts to detect the current step and continue from there.
