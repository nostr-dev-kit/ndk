# @nostr-dev-kit/ndk-cache-dexie

## 2.7.8

### Patch Changes

- Updated dependencies [53768a2]
    - @nostr-dev-kit/ndk@3.0.0

## 2.7.8

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

## 2.6.44

### Patch Changes

- Bump versions for republish

## 2.6.43

### Patch Changes

- Updated dependencies [b7e7f92]
    - @nostr-dev-kit/ndk@2.17.1

## 2.6.42

### Patch Changes

- Updated dependencies [73c6a2f]
- Updated dependencies [fad1f3d]
    - @nostr-dev-kit/ndk@2.17.0

## 2.6.40

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.15.0

## 2.6.39

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.38

## 2.6.38

### Patch Changes

- Updated dependencies [2886111]
- Updated dependencies [96341c3]
    - @nostr-dev-kit/ndk@2.14.37

## 2.6.37

### Patch Changes

- Updated dependencies [8bd22bd]
    - @nostr-dev-kit/ndk@2.14.36

## 2.6.36

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.35

## 2.6.35

### Patch Changes

- Updated dependencies [d89dbc6]
- Updated dependencies [fff020a]
    - @nostr-dev-kit/ndk@2.14.34

## 2.6.34

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.33

## 2.6.33

### Patch Changes

- Updated dependencies [9cb8407]
    - @nostr-dev-kit/ndk@2.14.32

## 2.6.32

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.31

## 2.6.31

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.30

## 2.6.30

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.29

## 2.6.29

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.28

## 2.6.28

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.27

## 2.6.27

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.26

## 2.6.26

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.25

## 2.6.25

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.24

## 2.6.24

### Patch Changes

- Updated dependencies [7476407]
    - @nostr-dev-kit/ndk@2.14.23

## 2.6.23

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.22

## 2.6.22

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.21

## 2.6.21

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.20

## 2.6.20

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.19

## 2.6.19

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.18

## 2.6.18

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.17

## 2.6.17

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.16

## 2.6.16

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.15

## 2.6.15

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.14

## 2.6.14

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.13

## 2.6.13

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.12

## 2.6.12

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.11

## 2.6.11

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.10

## 2.6.10

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.8

## 2.6.9

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.7

## 2.6.8

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.6

## 2.6.7

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.5

## 2.6.6

### Patch Changes

- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.4

## 2.6.5

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.3

## 2.6.4

### Patch Changes

- bump

## 2.6.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.2

## 2.6.2

### Patch Changes

- bump

## 2.6.2

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.1

## 2.6.1

### Patch Changes

- c83166a: bump
- 9d1a79c: performance improvements
- import changes
- Updated dependencies [c83166a]
- Updated dependencies [5ab19ef]
- Updated dependencies [6e16e06]
- Updated dependencies
- Updated dependencies [5ab19ef]
    - @nostr-dev-kit/ndk@2.14.0

## 2.5.16-rc1.0

### Patch Changes

- 9d1a79c: performance improvements

## 2.5.15

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.12.2

## 2.5.14

### Patch Changes

- Updated dependencies [3ea9695]
- Updated dependencies [cca3357]
- Updated dependencies [1235f69]
    - @nostr-dev-kit/ndk@2.12.1

## 2.5.13

### Patch Changes

- fix new query() function signature

## 2.5.12

### Patch Changes

- Updated dependencies [f255a07]
- Updated dependencies [f255a07]
- Updated dependencies [2171140]
- Updated dependencies [72c8492]
- Updated dependencies [72c8492]
    - @nostr-dev-kit/ndk@2.12.0

## 2.5.11

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.11.2

## 2.5.10

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.11.1

## 2.5.9

### Patch Changes

- 5da9c99: add support in dexie cache to retrieve profile info synchronously
- Updated dependencies [35987be]
- Updated dependencies [689305c]
- Updated dependencies [35987be]
- Updated dependencies [35987be]
- Updated dependencies
- Updated dependencies [4ed75a6]
    - @nostr-dev-kit/ndk@2.11.0

## 2.5.8

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.10.7

## 2.5.7

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.10.6

## 2.5.6

### Patch Changes

- Updated dependencies [5939a3e]
- Updated dependencies
- Updated dependencies [f2a0cce]
    - @nostr-dev-kit/ndk@2.10.5

## 2.5.5

### Patch Changes

- Updated dependencies [5bed70c]
- Updated dependencies [873ad4a]
    - @nostr-dev-kit/ndk@2.10.4

## 2.5.4

### Patch Changes

- Updated dependencies [0fc66c5]
    - @nostr-dev-kit/ndk@2.10.3

## 2.5.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.10.2

## 2.5.2

### Patch Changes

- d6cfa8a: track at which timestamp we cached events
- Updated dependencies [d6cfa8a]
- Updated dependencies [d6cfa8a]
- Updated dependencies [d6cfa8a]
- Updated dependencies [722345b]
    - @nostr-dev-kit/ndk@2.10.1

## 2.5.1

### Patch Changes

- apply limit filter
- abb3cd9: add tests
- index event kinds and add byKinds filter
- improve profile fetching from dexie
- 3029124: add methods to access and manage unpublished events from the cache
- Updated dependencies [ec83ddc]
- Updated dependencies [18c55bb]
- Updated dependencies
- Updated dependencies [18c55bb]
- Updated dependencies
- Updated dependencies
- Updated dependencies [3029124]
    - @nostr-dev-kit/ndk@2.10.0

## 2.5.0

### Minor Changes

- fix bug where we are indexing really events tags unrestricted
- control that we don't unnecessarily load more stuff into the LRU beyond it's max size

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.9.1

## 2.4.3

### Patch Changes

- 548f4d8: add optimistic updates
- Updated dependencies [94018b4]
- Updated dependencies [548f4d8]
    - @nostr-dev-kit/ndk@2.9.0

## 2.4.2

### Patch Changes

- cache relay reconnection status
- Updated dependencies [0af033f]
- Updated dependencies
    - @nostr-dev-kit/ndk@2.8.2

## 2.4.1

### Patch Changes

- e40312b: get all profiles that match a filter function from a cahce
- Updated dependencies [e40312b]
- Updated dependencies
    - @nostr-dev-kit/ndk@2.8.1

## 2.4.0

### Minor Changes

- 949d26a: Add LRU cache for zappers specs
- ba2a206: improve LRU caches -- refactor to make adding new caches easier
- bump

### Patch Changes

- a602d0c: performance improvements on cache
- fcd41ba: fix bug where we are REQing events even if they were cached and the filter has completed
- Updated dependencies [91d873c]
- Updated dependencies [6fd9ddc]
- Updated dependencies [0b8f331]
- Updated dependencies
- Updated dependencies [f2898ad]
- Updated dependencies [9b92cd9]
- Updated dependencies
- Updated dependencies [6814f0c]
- Updated dependencies [89b5b3f]
- Updated dependencies [9b92cd9]
- Updated dependencies [27b10cc]
- Updated dependencies
- Updated dependencies
- Updated dependencies [ed7cdc4]
    - @nostr-dev-kit/ndk@2.8.0

## 2.3.1

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.7.1

## 2.3.0

### Minor Changes

- Cache NIP-05 and zap specs

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.7.0

## 2.2.10

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.6.1

## 2.2.9

### Patch Changes

- c2db3c1: delete events from cache
- Updated dependencies
- Updated dependencies [c2db3c1]
- Updated dependencies
- Updated dependencies [c2db3c1]
- Updated dependencies [c2db3c1]
    - @nostr-dev-kit/ndk@2.6.0

## 2.2.8

### Patch Changes

- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.5.1

## 2.2.7

### Patch Changes

- Updated dependencies [e08fc74]
    - @nostr-dev-kit/ndk@2.5.0

## 2.2.6

### Patch Changes

- 15bcc10: fix profile LRU Cache
- Updated dependencies [111c1ea]
- Updated dependencies [5c0ae51]
- Updated dependencies [6f5ea49]
- Updated dependencies [3738d39]
- Updated dependencies [d22239a]
    - @nostr-dev-kit/ndk@2.4.1

## 2.2.5

### Patch Changes

- Updated dependencies [b9bbf1d]
    - @nostr-dev-kit/ndk@2.4.0

## 2.2.4

### Patch Changes

- Updated dependencies
- Updated dependencies [885b6c2]
- Updated dependencies [5666d56]
    - @nostr-dev-kit/ndk@2.3.3

## 2.2.3

### Patch Changes

- Updated dependencies
- Updated dependencies [4628481]
- Updated dependencies
    - @nostr-dev-kit/ndk@2.3.2

## 2.2.2

### Patch Changes

- Updated dependencies [ece965f]
    - @nostr-dev-kit/ndk@2.3.1

## 2.2.1

### Patch Changes

- Updated dependencies [54cec78]
- Updated dependencies [ef61d83]
- Updated dependencies [98b77dd]
- Updated dependencies [46b0c77]
- Updated dependencies [082e243]
    - @nostr-dev-kit/ndk@2.3.0

## 2.1.4

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.2.0

## 2.0.10

### Patch Changes

- Updated dependencies [180d774]
- Updated dependencies [7f00c40]
    - @nostr-dev-kit/ndk@2.1.3

## 2.0.9

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.1.2

## 2.0.8

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.1.1

## 2.0.7

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.1.0

## 2.0.6

### Patch Changes

- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.0.6

## 2.0.5

### Patch Changes

- Updated dependencies
- Updated dependencies [d45d962]
    - @nostr-dev-kit/ndk@2.0.5

## 2.0.4

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.0.2

## 1.3.6

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.0.0

## 1.3.5

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@1.4.2

## 1.3.4

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@1.4.1

## 1.3.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@1.4.0

## 1.3.3

### Patch Changes

- Updated dependencies [b3561af]
    - @nostr-dev-kit/ndk@1.3.2

## 1.3.2

### Patch Changes

- Add kind:0 to LRU cache regardless of how they are fetched

## 1.3.1

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@1.3.1

## 1.3.0

### Minor Changes

- 3440768: User profile dedicated cache

### Patch Changes

- Updated dependencies [88df10a]
- Updated dependencies [c225094]
- Updated dependencies [cf4a648]
- Updated dependencies [3946078]
- Updated dependencies [3440768]
    - @nostr-dev-kit/ndk@1.3.0
