---
"@nostr-dev-kit/sync": minor
---

Add onEvents batch handler for O(n) performance

Implemented batch event processing handler for NDK Sync, improving performance from O(n²) to O(n) when processing large numbers of events. The `onEvents` callback allows efficient batch processing of synchronized events.
