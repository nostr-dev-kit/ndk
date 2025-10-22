---
"@nostr-dev-kit/ndk": patch
---

Add AI guardrail for replaceable events with old timestamps. Warns when calling `publish()` on a replaceable event (kind 0, 3, 10k-20k, 30k-40k) with a `created_at` older than 10 seconds, guiding developers to use `publishReplaceable()` instead to ensure proper event replacement on relays.
