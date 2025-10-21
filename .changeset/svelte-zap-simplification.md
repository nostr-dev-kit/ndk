---
"@nostr-dev-kit/svelte": patch
---

Simplify zap function to use ndk.wallet and ndk.$currentPubkey

Refactored the zap function to access wallet directly from ndk.wallet instead of ndk.$wallet.wallet, and use ndk.$currentPubkey instead of requiring an active session. This simplifies the code and makes it more robust.
