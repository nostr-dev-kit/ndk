---
"@nostr-dev-kit/svelte": minor
---

Add read-only session support to ReactiveSessionsStore

Updated the Svelte 5 sessions store to support read-only sessions:
- `login()` and `add()` methods now accept both NDKSigner and NDKUser
- Added `isReadOnly(pubkey?)` method to check if a session has signer access
- Sessions created with just an NDKUser are automatically read-only