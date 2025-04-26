# @nostr-dev-kit/ndk-cache-sqlite-wasm

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
