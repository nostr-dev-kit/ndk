---
"@nostr-dev-kit/svelte": minor
---

Add reactive zap subscription system

Comprehensive zap support for Svelte with reactive subscriptions and utilities:

**$zaps() subscription method:**
- Reactive zap subscriptions on events or users
- Support for both NIP-57 (lightning) and NIP-61 (nutzaps)
- Validation for both zap types
- Filter by zap method
- Aggregate metrics (count, total amount)
- Support for validated-only zaps

**ReactiveFollows class:**
- Reactive wrapper around follow set
- Network-aware add/remove operations

**Utility functions:**
- Extract zap amount, sender, and comments
- Type-safe zap validation and parsing

Example usage:
```typescript
const zapSub = ndk.$zaps(() => ({
  target: event,
  validatedOnly: true
}));

// Access zap metrics
zapSub.totalAmount
zapSub.count
zapSub.events
```
