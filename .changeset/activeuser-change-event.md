---
"@nostr-dev-kit/ndk": minor
"@nostr-dev-kit/svelte": minor
---

Add activeUser:change event to NDK and $currentUser() reactive accessor to NDKSvelte

- NDK now emits an `activeUser:change` event whenever the active user changes (via signer, direct assignment, or read-only sessions)
- NDKSvelte adds a `$currentUser()` method that returns a reactive value tracking the active user
- This properly handles all scenarios including read-only sessions without signers
- Fixes race condition where signer:ready event fired before activeUser was set
