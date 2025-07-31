---
"@nostr-dev-kit/ndk": patch
---

Fix relay reconnection logic after long disconnections

- Fixed exponential backoff calculation that was using XOR operator (^) instead of exponentiation
- Added detection and cleanup of stale WebSocket connections after system sleep/resume
- Improved connection state handling to prevent infinite reconnection loops

The reconnection delay calculation was incorrectly using `(1000 * attempt) ^ 4` which performed a bitwise XOR operation resulting in delays of only 1-2 seconds. This has been corrected to use `Math.pow(1000 * (attempt + 1), 2)` for proper exponential backoff.