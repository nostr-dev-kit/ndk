---
"@nostr-dev-kit/ndk": patch
---

feat: add robust relay keepalive and reconnection handling

Implement comprehensive relay connection monitoring and recovery:
- Add keepalive mechanism to detect silent/stale relay connections
- Monitor WebSocket readyState every 5 seconds to catch dead connections
- Detect system sleep/wake events by monitoring time gaps
- Smart reconnection backoff: aggressive after idle/sleep vs standard exponential
- Track idle connections and reset backoff appropriately
- Properly handle stale WebSocket connections with cleanup and reconnect
- Add connection probing before assuming connections are dead

This significantly improves NDK's resilience to network interruptions, system sleep/wake cycles, and silent relay failures.