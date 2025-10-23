---
"@nostr-dev-kit/ndk": patch
---

Fix race condition that caused empty REQ messages to be sent to relays when subscriptions were closed before their scheduled execution time
