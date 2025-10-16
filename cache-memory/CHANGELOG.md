# @nostr-dev-kit/cache-memory

## 2.7.7

### Patch Changes

- 28ebbe1: Fix NIP-17 gift-wrapped message decryption caching. Previously, decrypted events were being repeatedly decrypted because the cache key (wrapper ID) didn't match the stored key (rumor ID). Now properly caches decrypted gift-wrapped messages using the wrapper event ID as the cache key, eliminating redundant decryption operations.

    Adds comprehensive tests to verify cache behavior with gift-wrapped events.

- Updated dependencies [59a97a5]
- Updated dependencies [28ebbe1]
    - @nostr-dev-kit/ndk@2.17.9

## 2.7.6

### Patch Changes

- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.6

## 2.7.5

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.5

## 2.7.4

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.4

## 2.7.3

### Patch Changes

- Updated dependencies [8678b1f]
- Updated dependencies [c901395]
    - @nostr-dev-kit/ndk@2.17.3

## 2.7.2

### Patch Changes

- Updated dependencies [8315d5e]
- Updated dependencies [d9d5662]
- Updated dependencies [6fb3a7f]
- Updated dependencies [028367b]
    - @nostr-dev-kit/ndk@2.18.0

## 2.7.1

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.1

## 2.7.0

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

## 2.6.47

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.16.1

## 2.6.46

### Patch Changes

- Updated dependencies [e596023]
    - @nostr-dev-kit/ndk@2.16.0

## 2.6.45

### Patch Changes

- Updated dependencies [a912a2c]
    - @nostr-dev-kit/ndk@2.15.3
