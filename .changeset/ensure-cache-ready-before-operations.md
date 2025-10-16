---
"@nostr-dev-kit/ndk": patch
"@nostr-dev-kit/cache-sqlite-wasm": patch
"@nostr-dev-kit/cache-sqlite": patch
---

Ensure async cache adapters are fully initialized before NDK operations. Cache initialization now happens during `connect()` alongside relay connections, and subscriptions wait for cache readiness before starting.

SQLite WASM cache improvements:
- Add initialization guards to all cache functions to prevent race conditions
- Implement proper database migration versioning system (v2)
- Support multi-field profile search (search across name, displayName, nip05 simultaneously)
- Remove verbose migration logging (keep only errors)
- Bump version to 0.8.1
