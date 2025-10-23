---
"@nostr-dev-kit/cache-sqlite-wasm": minor
---

Major performance improvements for cache-sqlite-wasm adapter

- Added binary serialization for worker communication (10-15x faster than JSON)
- Implemented LRU cache for events and metadata with configurable size limits
- Added performance monitoring system with detailed metrics tracking
- Improved schema with raw event storage column for faster serialization
- Removed deprecated functions (getEventRelays, setEventDup)
- Added configurable performance tracking levels (none/basic/detailed/verbose)
- Zero-copy ArrayBuffer transfers between worker and main thread
