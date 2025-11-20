---
"@nostr-dev-kit/svelte": patch
---

Fix logout to properly clear $currentUser and $currentPubkey. Previously, after calling logout(), the session was cleared but ndk.$currentUser and ndk.$currentPubkey remained set to the logged-out user, even though localStorage showed an empty sessions array.

The issue was caused by logout() and logoutAll() methods manually updating reactive state, which created a race condition with the subscription handler. Fixed by:
1. Adding code to clear ndk.activeUser and ndk.signer in the subscription handler when activePubkey is undefined
2. Removing manual state updates from logout() and logoutAll() methods to let the subscription handler handle all state updates consistently
