# @nostr-dev-kit/messages

## 2.0.0

### Patch Changes

- Updated dependencies [b8e7a06]
- Updated dependencies [ad7936b]
- Updated dependencies [b5bdb2c]
- Updated dependencies [4b8d146]
- Updated dependencies [8f116fa]
- Updated dependencies [b5bdb2c]
- Updated dependencies [72fc3b0]
- Updated dependencies [73adeb9]
- Updated dependencies [b5bdb2c]
    - @nostr-dev-kit/ndk@3.0.0

## 1.0.0

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.18.0

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
