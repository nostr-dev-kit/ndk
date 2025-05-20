# @nostr-dev-kit/ndk-cache-sqlite-wasm

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
