---
"@nostr-dev-kit/sessions": minor
---

Remove profile support and improve event handling

- **BREAKING**: Removed `profile` field from `NDKSession`, `SessionStartOptions`, and `SerializedSession` interfaces
- **BREAKING**: Removed `profile` option from login - profiles should be fetched separately if needed
- Removed redundant `shouldStartFetching` check - `startSession` now handles empty options properly
- Use `NDKKind` constants instead of raw numbers for better type safety
- Use `NDKRelayList` wrapper for relay list parsing instead of manual implementation
- Updated documentation with all supported session options
