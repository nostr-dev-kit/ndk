# @nostr-dev-kit/messages

## 0.1.0

### Minor Changes

- ed3110a: Automatic cache module detection for NDKMessenger

    NDKMessenger now automatically detects and uses the cache module system when NDK has a cache adapter with module support, eliminating manual setup boilerplate.

    Before:

    ```typescript
    const messenger = new NDKMessenger(ndk, {
        storage: new CacheModuleStorage(cacheAdapter, ndk.activeUser!.pubkey),
    });
    ```

    After:

    ```typescript
    const messenger = new NDKMessenger(ndk);
    // Automatically uses cache if NDK has a cache adapter!
    ```

    The messenger now:
    - Automatically upgrades to CacheModuleStorage when started if NDK has a cache adapter
    - Falls back to MemoryAdapter if no cache is available
    - Still allows explicit storage configuration for advanced use cases

- Updated dependencies [ad1a3ee]
- Updated dependencies [a56276b]
- Updated dependencies [ed3110a]
- Updated dependencies [9b67ee6]
    - @nostr-dev-kit/ndk@2.17.7
