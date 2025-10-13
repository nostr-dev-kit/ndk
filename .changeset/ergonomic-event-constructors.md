---
"@nostr-dev-kit/sessions": minor
---

Add ergonomic `eventConstructors` option for registering event classes

Adds a new `eventConstructors` option to session configuration that provides a more ergonomic API for registering custom event classes. Instead of manually creating a `Map<NDKKind, Constructor>`, you can now pass an array of event class constructors that have a static `kinds` property.

**Before:**
```typescript
await sessions.login(signer, {
  events: new Map([
    [NDKKind.BlossomList, NDKBlossomList],
    [NDKKind.Article, NDKArticle]
  ])
});
```

**After:**
```typescript
await sessions.login(signer, {
  eventConstructors: [NDKBlossomList, NDKArticle]
});
```

The implementation uses the static `kinds` property on each constructor to automatically map kinds to their constructors. Both options can be used together and will be merged.
