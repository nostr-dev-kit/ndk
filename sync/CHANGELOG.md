# @nostr-dev-kit/sync

## 0.3.1

### Patch Changes

- bump
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.1

## 0.3.0

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

- 2adef59: Remove ndkSync function from public API - use NDKSync class instead

    **BREAKING**: The low-level `ndkSync` function is no longer exported. All packages should use the `NDKSync` class which provides:
    - Automatic relay capability caching
    - Fallback to fetchEvents for non-negentropy relays
    - Proper error handling and retry logic

    **Migration**:

    ```typescript
    // Before
    import { ndkSync } from "@nostr-dev-kit/sync";
    const result = await ndkSync.call(ndk, filters, opts);

    // After
    import { NDKSync } from "@nostr-dev-kit/sync";
    const result = await NDKSync.sync(ndk, filters, opts);
    ```

    Updated wot package to use NDKSync, removing duplicate relay filtering logic.

### Patch Changes

- 3407126: Fix negentropy relay capability caching and add fallback support
    - Fixed async callback race condition where cache updates weren't awaited
    - Added DRY refactoring with `syncSingleRelay()` helper method
    - Implemented automatic fallback to `fetchEvents` for relays without negentropy support
    - Both `sync()` and `syncAndSubscribe()` now try all relays and automatically fall back when needed
    - Events are properly cached even when using fallback mechanism
    - Updated wallet to use `NDKSync` class instead of low-level `ndkSync` function for proper capability caching

- Updated dependencies [344c313]
- Updated dependencies [344c313]
    - @nostr-dev-kit/ndk@2.17.0

## Unreleased

### Patch Changes

- Use centralized NIP-11 implementation from @nostr-dev-kit/ndk
    - Removed local `RelayInformation` type - use `NDKRelayInformation` from ndk-core
    - Removed local `fetchRelayInformation` function - use the one from ndk-core
    - Updated `supportsNegentropy` and `getRelayCapabilities` to use `relay.fetchInfo()` when passed an NDKRelay instance
    - Breaking change: `RelayInformation` and `fetchRelayInformation` are no longer exported from @nostr-dev-kit/sync
    - Migration: Import from @nostr-dev-kit/ndk instead

    ```typescript
    // Before
    import { fetchRelayInformation, RelayInformation } from "@nostr-dev-kit/sync";

    // After
    import { fetchRelayInformation, NDKRelayInformation } from "@nostr-dev-kit/ndk";
    ```

## 0.2.0

### Minor Changes

- 3bffc04: Initial release of @nostr-dev-kit/sync - NIP-77 Negentropy protocol implementation for efficient event synchronization

    **Features:**
    - Bandwidth-efficient event sync using set reconciliation
    - Automatic cache integration with NDK cache adapters
    - Sequential multi-relay sync for optimal efficiency
    - Simple `await ndk.sync(filters)` API
    - Auto-fetch missing events
    - Relay capability detection (NIP-11)
    - `syncAndSubscribe` pattern for seamless historical + live event streaming
    - TypeScript support with full type definitions

    **Core exports:**
    - `ndkSync()` - Main sync function
    - `syncAndSubscribe()` - Combined sync + subscribe pattern
    - `supportsNegentropy()` - Check relay NIP-77 support
    - `filterNegentropyRelays()` - Filter relays by NIP-77 capability
    - `getRelayCapabilities()` - Get detailed relay info
    - Negentropy protocol classes for advanced usage

### Patch Changes

- Updated dependencies [a912a2c]
    - @nostr-dev-kit/ndk@2.15.3
