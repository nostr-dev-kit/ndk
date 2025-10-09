---
"@nostr-dev-kit/ndk": patch
---

test: add comprehensive event deduplication and onRelays tracking tests

Adds test coverage for event deduplication behavior and onRelays accumulation. Tests verify that:
- onRelays correctly accumulates relays as duplicate events arrive
- event:dup is emitted with proper parameters (event, relay, timeSinceFirstSeen)
- First event occurrence triggers 'event' while subsequent ones trigger 'event:dup'
- The relay parameter in event:dup correctly identifies which relay sent the duplicate
- Edge cases like rapid duplicates and events without relay info are handled correctly