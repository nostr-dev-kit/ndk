---
"@nostr-dev-kit/svelte": patch
---

Add event throttling to prevent excessive UI updates

Implemented throttling mechanism for reactive event subscriptions to prevent excessive UI updates when many events arrive in quick succession. This improves performance and reduces unnecessary re-renders in Svelte applications.
