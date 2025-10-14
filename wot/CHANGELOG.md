# @nostr-dev-kit/wot

## 0.3.6

### Patch Changes

- Update @nostr-dev-kit/ndk dependency to ^2.17.3
- Updated dependencies
    - @nostr-dev-kit/sync@0.3.4

## 0.3.5

### Patch Changes

- bump
- Updated dependencies
    - @nostr-dev-kit/sync@0.3.3

## 0.3.4

### Patch Changes

- bump
- Updated dependencies
    - @nostr-dev-kit/sync@0.3.2

## 0.3.3

### Patch Changes

- bump
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.1
    - @nostr-dev-kit/sync@0.3.1

## 0.3.2

### Patch Changes

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

- Updated dependencies [344c313]
- Updated dependencies [2adef59]
- Updated dependencies [3407126]
- Updated dependencies [344c313]
    - @nostr-dev-kit/ndk@2.17.0
    - @nostr-dev-kit/sync@0.3.0

## 0.3.1

### Patch Changes

- bump

## 0.3.0

### Minor Changes

- 446b753: Add efficient negentropy-based contact list syncing to Web of Trust builder

    **Features:**
    - Smart fetch strategy: uses negentropy for large batches (>= 5 authors by default)
    - Automatic relay detection for NIP-77 support
    - Graceful fallback to subscription-based fetch when needed
    - Configurable threshold via `negentropyMinAuthors` option
    - Significant bandwidth savings when building large WoT graphs

    **New options for `wot.load()`:**
    - `useNegentropy?: boolean` - Enable negentropy sync (default: true)
    - `negentropyMinAuthors?: number` - Min authors to use negentropy (default: 5)
    - `relayUrls?: string[]` - Specific relays for sync

    **Performance improvements:**
    - 10-100x bandwidth reduction for large WoT graphs
    - Efficient set reconciliation via NIP-77
    - Sequential multi-relay sync with deduplication

### Patch Changes

- Updated dependencies [a912a2c]
- Updated dependencies [3bffc04]
    - @nostr-dev-kit/ndk@2.15.3
    - @nostr-dev-kit/sync@0.2.0

## 0.2.7

### Patch Changes

- b7e7f92: Add pubkey validation in constructor and p-tag parsing to prevent invalid pubkeys from causing issues
- Updated dependencies [b7e7f92]
    - @nostr-dev-kit/ndk@2.17.1

## 0.2.1

### Patch Changes

- fix: validate root pubkey in NDKWoT constructor

    Added validation to ensure the root pubkey passed to NDKWoT constructor is a valid 64-character hex string. This prevents invalid pubkeys from being used in filter authors arrays, which would cause errors when building the WoT graph at depth > 0.

    The validation happens in the constructor and throws an error with a clear message if an invalid pubkey is provided. This catches issues early rather than failing deep in the fetchEvents call.

## 0.2.0

### Minor Changes

- Initial release of @nostr-dev-kit/wot - Web of Trust utilities for NDK

    Features:
    - Build WoT graph from contact lists with configurable depth
    - Calculate WoT scores and distances for pubkeys
    - Filter and rank events by WoT
    - Reference counting and follower tracking
    - Efficient graph traversal with timeout support

## 0.1.1

### Patch Changes

- bump
