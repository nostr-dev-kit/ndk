---
"@nostr-dev-kit/sync": minor
---

Initial release of @nostr-dev-kit/sync - NIP-77 Negentropy protocol implementation for efficient event synchronization

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
