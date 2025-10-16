---
"@nostr-dev-kit/svelte": patch
"@nostr-dev-kit/wallet": patch
---

Wallet configuration and management improvements:

**NDKCashuWallet**:
- Add `send()` method to create cashu tokens for sending amounts
- Add `update()` method to update wallet configuration (mints and relays) with proper replaceable event publishing
- Add static `create()` factory method for easy wallet creation with initial configuration

**ReactiveWalletStore (Svelte)**:
- Add reactive Svelte 5 store for wallet state management
- Automatic session integration with NDKSessionManager
- Reactive balance, status, and wallet state using $state runes
- Convenience methods and getters for mints, relays, and transactions
