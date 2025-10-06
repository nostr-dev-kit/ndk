---
"@nostr-dev-kit/ndk-cache-nostr": patch
---

Migrate to new subscription event pattern to eliminate race conditions

Updated subscription handling to use `.on()` event handlers instead of inline callbacks, matching the recent NDK core refactoring to prevent subscription race conditions with onEvent/onEose/onClose handlers.
