---
"@nostr-dev-kit/svelte": patch
---

Fix ReactivePoolStore to initialize with existing relay connections

- Initialize pool store with existing relay statuses on creation
- Properly reflect connected relays that were established before store initialization
