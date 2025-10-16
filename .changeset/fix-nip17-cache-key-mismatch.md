---
"@nostr-dev-kit/ndk": patch
"@nostr-dev-kit/cache-dexie": patch
"@nostr-dev-kit/cache-memory": patch
"@nostr-dev-kit/cache-sqlite": patch
"@nostr-dev-kit/cache-sqlite-wasm": patch
"@nostr-dev-kit/mobile": patch
---

Fix NIP-17 gift-wrapped message decryption caching. Previously, decrypted events were being repeatedly decrypted because the cache key (wrapper ID) didn't match the stored key (rumor ID). Now properly caches decrypted gift-wrapped messages using the wrapper event ID as the cache key, eliminating redundant decryption operations.

Adds comprehensive tests to verify cache behavior with gift-wrapped events.
