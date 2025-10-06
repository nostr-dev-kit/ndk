# @nostr-dev-kit/sync

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
