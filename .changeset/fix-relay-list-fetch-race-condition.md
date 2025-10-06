---
"@nostr-dev-kit/ndk": patch
---

Fix race condition in relay list fetching that prevented subscriptions from connecting to user relays

The `getRelayListForUsers` function had a race condition where the timeout (1000ms) was firing before EOSE arrived from relays (~1300ms), causing it to resolve with an empty relay list. This prevented the `user:relay-list-updated` event from being emitted, which meant subscriptions would never connect to the user's relays.

- Added `resolved` flag to prevent double-resolution of the promise
- Implemented conditional timeout that extends by 3 seconds only when relays are disconnected or connecting
- When relays are already connected, uses the normal timeout since EOSE should resolve it quickly
- This ensures subscriptions created before relay connection are properly sent to relays when they come online
