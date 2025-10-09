---
"@nostr-dev-kit/ndk": patch
"@nostr-dev-kit/ndk-cache-redis": patch
---

feat(cache-redis): add support for tracking multiple relays per event

The Redis cache adapter now properly tracks all relays an event has been seen from:
- Stores relay information in a separate Redis Set (`relays:{eventId}`) to track provenance
- Accumulates relays without duplicating entries using Redis Sets
- Restores all relay information when querying cached events
- Implements `setEventDup` method to handle relay tracking for duplicate events
- Registers all relays with NDK's subscription manager for proper `onRelays` behavior
- Fixes Redis connection status checks (now using 'ready' instead of 'connect')

This ensures proper relay provenance tracking which is essential for outbox model support and understanding event distribution across the network.