# @nostr-dev-kit/ndk-cache-sqlite

## 7.0.0

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.18.0

## 6.1.1

### Patch Changes

- 59a97a5: Ensure async cache adapters are fully initialized before NDK operations. Cache initialization now happens during `connect()` alongside relay connections, and subscriptions wait for cache readiness before starting.

    SQLite WASM cache improvements:
    - Add initialization guards to all cache functions to prevent race conditions
    - Implement proper database migration versioning system (v2)
    - Support multi-field profile search (search across name, displayName, nip05 simultaneously)
    - Remove verbose migration logging (keep only errors)
    - Bump version to 0.8.1

- 28ebbe1: Fix NIP-17 gift-wrapped message decryption caching. Previously, decrypted events were being repeatedly decrypted because the cache key (wrapper ID) didn't match the stored key (rumor ID). Now properly caches decrypted gift-wrapped messages using the wrapper event ID as the cache key, eliminating redundant decryption operations.

    Adds comprehensive tests to verify cache behavior with gift-wrapped events.

- Updated dependencies [59a97a5]
- Updated dependencies [28ebbe1]
    - @nostr-dev-kit/ndk@2.17.9

## 6.1.0

### Minor Changes

- Updated dependencies [ad1a3ee]
- Updated dependencies [a56276b]
- Updated dependencies [ed3110a]
- Updated dependencies [9b67ee6]
    - @nostr-dev-kit/ndk@2.17.7

## 6.0.0

### Patch Changes

- Updated dependencies [8315d5e]
- Updated dependencies [d9d5662]
- Updated dependencies [6fb3a7f]
- Updated dependencies [028367b]
    - @nostr-dev-kit/ndk@2.17.6

## 5.0.0

### Minor Changes

- 344c313: Add comprehensive relay metadata and statistics caching system

    This release introduces a flexible relay metadata caching system that allows both core functionality and packages to store and retrieve relay-specific information persistently.

    **Core Features:**
    - **Expanded NDKCacheRelayInfo** type with connection tracking, NIP-11 caching, and extensible metadata
    - **NIP-11 automatic caching** in `relay.fetchInfo()` with 24-hour TTL
    - **Connection failure tracking** with fields for consecutive failures and backoff timing
    - **Package-specific metadata** with namespacing to avoid conflicts

    **Cache Adapter Updates:**
    All cache adapters now support metadata merging:
    - `cache-memory`: In-memory storage with proper metadata merging
    - `cache-dexie`: IndexedDB storage with schema v17
    - `cache-sqlite`: SQLite storage with updated schema
    - `cache-sqlite-wasm`: WASM SQLite with metadata support

    **Sync Package:**
    - Migrated from in-memory to persistent relay capability caching
    - Negentropy support detection now persists across restarts
    - Capability cache TTL of 1 hour

    **Benefits:**
    - Reduces unnecessary network requests (NIP-11 cached for 24 hours)
    - Enables smart connection backoff strategies
    - Allows packages to share relay metadata infrastructure
    - Persists across application restarts when using persistent cache adapters

    **Breaking Changes:**
    - `NDKSync.getRelayCapability()` is now async
    - `NDKSync.clearCapabilityCache()` is now async
    - cache-dexie schema bumped to v17 (auto-migrates)

    **Migration:**
    No action required for basic usage. If you're using `NDKSync.getRelayCapability()` or `clearCapabilityCache()`, add `await`:

    ```typescript
    // Before
    const capability = sync.getRelayCapability(url);

    // After
    const capability = await sync.getRelayCapability(url);
    ```

    See `core/docs/relay-metadata-caching.md` for full documentation and examples.

### Patch Changes

- Updated dependencies [344c313]
- Updated dependencies [344c313]
    - @nostr-dev-kit/ndk@2.17.0

## 4.0.1

### Patch Changes

- bump

## 4.0.0

### Patch Changes

- Updated dependencies [e596023]
    - @nostr-dev-kit/ndk@2.16.0

## 3.0.0

### Patch Changes

- Updated dependencies [73c6a2f]
- Updated dependencies [fad1f3d]
    - @nostr-dev-kit/ndk@2.17.0

## 2.0.0

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.16.0

## 1.0.0

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.15.0
