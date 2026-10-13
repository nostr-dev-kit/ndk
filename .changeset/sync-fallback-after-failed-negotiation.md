---
"@nostr-dev-kit/sync": patch
---

Fall back to `fetchEvents` when a NIP-77 negotiation fails (relay answers `NOTICE`/`NEG-ERR`, or the session times out) instead of reporting an empty sync as success.

- `syncAndSubscribe()` and `NDKSync.syncAndSubscribe()` now end each relay with exactly one of `onRelaySynced` (history obtained through Negentropy or the fallback) or `onRelayError` (Negentropy and the fallback both failed). Observable change: `NDKSync.syncAndSubscribe()` no longer calls `onRelayError` for a negotiation failure that the fallback recovered.
- `syncAndSubscribe()` now forwards `onNegotiationProgress`.
- `NDKSync.sync()` keeps reporting negotiation failures through `onRelayError` and now includes the fallback events in the result (`need`/`have` are empty for a relay that fell back).
