---
"@nostr-dev-kit/ndk": patch
---

Add futureTimestampGrace option to protect against events with far-future timestamps

Added a new `futureTimestampGrace` optional parameter to the NDK constructor that allows filtering out events with timestamps too far in the future. When set, subscriptions will automatically discard events where `created_at` is more than the specified number of seconds ahead of the current time. This helps protect against malicious relays sending events with manipulated timestamps. Defaults to `undefined` (no filtering) for backward compatibility.
