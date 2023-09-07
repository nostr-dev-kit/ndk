---
"@nostr-dev-kit/ndk": minor
---

User npub/hexpubkey become optional. This means that if you refer to aser by their
hexpubkey, npub won't be computed until it's necessary.

This is a breaking change since hexpubkey goes from being called as function (`hexpubkey()`) to a getter (`hexpubkey`).
