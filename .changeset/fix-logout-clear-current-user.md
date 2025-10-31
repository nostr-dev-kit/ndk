---
"@nostr-dev-kit/svelte": patch
---

Fix logout to properly clear $currentUser and $currentPubkey. Previously, after calling logout(), the session was cleared but ndk.$currentUser and ndk.$currentPubkey remained set to the logged-out user, even though localStorage showed an empty sessions array. This has been fixed by ensuring that ndk.activeUser and ndk.signer are cleared when there is no active session.
