---
"@nostr-dev-kit/sync": patch
"@nostr-dev-kit/wallet": patch
---

Fix negentropy relay capability caching and add fallback support

- Fixed async callback race condition where cache updates weren't awaited
- Added DRY refactoring with `syncSingleRelay()` helper method
- Implemented automatic fallback to `fetchEvents` for relays without negentropy support
- Both `sync()` and `syncAndSubscribe()` now try all relays and automatically fall back when needed
- Events are properly cached even when using fallback mechanism
- Updated wallet to use `NDKSync` class instead of low-level `ndkSync` function for proper capability caching
