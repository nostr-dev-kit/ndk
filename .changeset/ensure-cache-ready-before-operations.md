---
"@nostr-dev-kit/ndk": patch
---

Ensure async cache adapters are fully initialized before NDK operations. Cache initialization now happens during `connect()` alongside relay connections, and subscriptions wait for cache readiness before starting. This prevents race conditions where subscriptions might attempt to query uninitialized caches.
