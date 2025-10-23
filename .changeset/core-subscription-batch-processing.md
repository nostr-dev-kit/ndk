---
"@nostr-dev-kit/ndk": minor
---

Subscription performance improvements and batch processing support

- Added `onEvents` callback option for batch processing of cached events
- Reduced default `groupableDelay` from 100ms to 10ms for faster subscription grouping
- Optimized cache result processing with single-pass timestamp calculation
- Added `onEventsHandler` parameter to `start()` method for direct batch handling
- Improved performance by eliminating per-event overhead in batch mode
