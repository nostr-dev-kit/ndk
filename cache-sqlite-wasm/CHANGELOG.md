# @nostr-dev-kit/ndk-cache-sqlite-wasm

## 0.8.2

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

## 0.8.1

### Patch Changes

- Add protocol versioning and validation to prevent worker message format mismatches

    **Problem:** Apps using NDK with SQLite WASM cache could crash with "object is not iterable" errors when stale or mismatched worker files were deployed. The signature verification handler would receive messages from the cache worker (or vice versa) and fail to parse them.

    **Solution:**
    1. **Message Format Validation**: The signature verification handler now validates incoming messages and logs clear, actionable errors when it receives incompatible formats, guiding developers to update their worker files.
    2. **Protocol Versioning**: Both workers now include protocol metadata in their messages:
        - Signature worker: Uses protocol name `ndk-sig-verify` with NDK version
        - Cache worker: Uses protocol name `ndk-cache-sqlite` with cache-sqlite-wasm version
    3. **Version Checking**: Message handlers detect and warn about version mismatches between library code and deployed worker files, helping developers identify when worker files need to be updated.

    **Benefits:**
    - No more silent failures or cryptic errors
    - Clear guidance when worker files are stale or misconfigured
    - Easier debugging of worker-related issues
    - Future-proof protocol evolution

    **Migration:** No breaking changes. Existing apps will see helpful error messages if they have worker mismatches, guiding them to fix the issue.

## 0.8.0

### Minor Changes

- Add NIP-05 verification caching to SQLite adapters

    Implements NIP-05 verification result caching in both cache-sqlite-wasm and mobile SQLite adapters to prevent unnecessary network requests. Both successful and failed verifications are now cached with smart expiration:
    - Successful verifications are cached indefinitely
    - Failed verifications are cached for 1 hour (configurable) to prevent hammering down/non-existent endpoints
    - Expired failed verifications return "missing" to trigger retry
    - Fresh failed verifications return null to prevent re-fetch

    This brings feature parity with cache-dexie and cache-memory adapters.

## 0.7.0

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

## 0.6.2

### Patch Changes

- bump

## 0.6.1

### Patch Changes

- b7e7f92: Fix "Database not initialized" race condition by making query function wait for initialization to complete

## 0.6.0

### Minor Changes

- 73c6a2f: Implement Cashu mint info and keyset caching in SQLite WASM adapter. Adds database tables and functions for storing/retrieving mint metadata and keysets with expiration tracking and comprehensive debug logging.

## 0.5.13

### Patch Changes

- Fix race condition when subscriptions start before cache initialization completes

    Previously, if a subscription started before `initializeAsync()` completed, the cache adapter would throw "Database not initialized" errors. This was a common footgun in apps where NDK subscriptions started immediately on load.

    The cache adapter now gracefully handles early queries by:
    - Returning a Promise that waits for initialization if called during init
    - Returning an empty array if called before initialization starts
    - Setting a `ready` flag to track initialization state

    This allows apps to start subscriptions immediately without waiting for cache initialization - they'll simply get cache hits once the database is ready.

## 0.5.12

### Patch Changes

- Add Cashu mint caching support with `loadCashuMintInfo`, `saveCashuMintInfo`, `loadCashuMintKeys`, and `saveCashuMintKeys` methods

## 0.5.10

### Patch Changes

- 2886111: Add filter validation to prevent undefined values in subscription filters

    Prevents runtime errors in cache adapters (especially SQLite WASM) that cannot handle undefined values in parameterized queries.

    The NDK constructor now accepts a `filterValidationMode` option:
    - `"validate"` (default): Throws an error when filters contain undefined values
    - `"fix"`: Automatically removes undefined values from filters
    - `"ignore"`: Skip validation entirely (legacy behavior)

    This fixes the "Wrong API use: tried to bind a value of an unknown type (undefined)" error in sqlite-wasm cache adapter.

## 0.5.9

### Patch Changes

- Fix circular structure error when adding unpublished and decrypted events by using event.serialize() instead of JSON.stringify()

## 0.5.8

### Patch Changes

- correct types

## 0.5.7

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.22

## 0.5.6

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.21

## 0.5.5

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.20

## 0.5.4

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.19

## 0.5.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.18

## 0.5.2

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.17

## 0.5.1

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.16

## 0.5.0

### Minor Changes

- bump

## 0.4.13

### Patch Changes

- add event_tags schema and update runMigrations to include it; correct relay_url reference in getRelayStatus

## 0.4.12

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.15

## 0.4.11

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.14

## 0.4.10

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.13

## 0.4.9

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.12

## 0.4.8

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.11

## 0.4.7

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.10

## 0.4.6

### Patch Changes

- proper type exports

## 0.4.5

### Patch Changes

- don't define sync methods when running in web worker mode instead of throwing when being used

## 0.4.4

### Patch Changes

- correct raw property

## 0.4.3

### Patch Changes

- modify normalization

## 0.4.2

### Patch Changes

- load queries as objects

## 0.4.1

### Patch Changes

- Fix serialization

## 0.4.0

### Minor Changes

- Add Web Worker support to improve performance and prevent UI blocking.

    This release adds optional Web Worker support to the NDK Cache SQLite WASM adapter. Users can now opt-in to running database operations in a separate thread, which prevents UI blocking during intensive operations.

    ## Features
    - Added `useWorker` and `workerUrl` options to the adapter configuration
    - Implemented a Web Worker script that handles database operations
    - Modified all database methods to work in both main thread and Web Worker modes
    - Added documentation for Web Worker setup in different frameworks (Next.js, Vite)
    - Created a Vite example application demonstrating Web Worker usage

    ## Usage

    ```typescript
    const cache = new NDKCacheAdapterSqliteWasm({
        useWorker: true,
        workerUrl: "/worker.js",
        wasmUrl: "/sql-wasm.wasm",
    });
    ```

    See the documentation in `docs/web-worker-setup.md` for detailed setup instructions.

## 0.4.0 (upcoming)

### New Features

- **Web Worker Support:** Added optional Web Worker mode to offload SQLite operations from the main thread.
    - Improves application responsiveness during heavy database operations
    - Configurable via new options: `useWorker`, `workerUrl`
    - See [Web Worker Setup](./docs/web-worker-setup.md) for detailed configuration instructions

### Breaking Changes

- **Web Worker/Async API Adaptation:** All database interaction methods in `NDKCacheAdapterSqliteWasm` are now asynchronous to support both main-thread and Web Worker modes.
    - If `useWorker` is enabled, all DB methods are async and communicate with the worker.
    - If `useWorker` is disabled, methods remain async but execute on the main thread.
- **Synchronous Methods Deprecated in Worker Mode:**
    - `fetchProfileSync` and `getAllProfilesSync` will throw an error if called when `useWorker` is true. Synchronous DB access is fundamentally incompatible with Web Worker mode.
    - For compatibility, these methods are still available in main-thread mode, but their use is discouraged in favor of async methods.
- **Migration:** Users should migrate to the async versions of all DB methods for compatibility with both main-thread and worker modes.

### Configuration

- **New Options:**
    - `useWorker: boolean` - Enable Web Worker mode (default: false)
    - `workerUrl: string` - URL to the worker script (required when useWorker is true)
- **Example:**
    ```typescript
    const cacheAdapter = new NDKCacheAdapterSqliteWasm({
        useWorker: true,
        workerUrl: "/dist/worker.js",
        wasmUrl: "/dist/sql-wasm.wasm",
    });
    ```

---

## 0.3.0

### Minor Changes

-   - The WASM file is now included in the build output and published with the package.
    - An ESM build (`dist/index.mjs`) is now provided alongside the CJS build for compatibility with modern tools (e.g., NextJS).
    - The package exports and files fields have been updated accordingly.

## 0.2.0

### Minor Changes

- ## Initial release: SQLite WASM cache adapter for NDK

    This release introduces the `ndk-cache-sqlite-wasm` package, a browser-compatible SQLite cache adapter for NDK, designed to match the features and API of the ndk-mobile SQLite adapter.

    ### Features
    - Implements the full NDKCacheAdapter interface, including:
        - Event caching (setEvent, getEvent, etc.)
        - Profile caching (fetchProfile, saveProfile, etc.)
        - Synchronous and asynchronous APIs
        - Relay status management
        - Decrypted event cache (getDecryptedEvent, addDecryptedEvent)
        - Unpublished event management (addUnpublishedEvent, getUnpublishedEvents, discardUnpublishedEvent)
    - Database schema and migration logic mirrors ndk-mobile's implementation.
    - Uses sql.js (WASM) for cross-platform SQLite support in browsers and JS environments.
    - Database is persisted automatically to IndexedDB with debounced saves for performance.
    - Example page included for browser testing and benchmarking.
    - Documentation is symlinked into the main docs/cache directory.

    ### Usage
    - Adapter is loaded and initialized automatically, including WASM and migrations.
    - No manual persistence required; database is loaded and saved automatically.
    - Example page demonstrates bulk event writing, reading, and performance measurement.

    ### Task summary

    This work included:
    - Designing a modular, maintainable package structure.
    - Implementing all required and advanced cache methods in their own files.
    - Ensuring full feature parity with ndk-mobile's SQLite adapter.
    - Providing browser persistence and performance optimizations.
    - Creating documentation and a live example.
    - Publishing frequent status updates to Nostr throughout the process.
