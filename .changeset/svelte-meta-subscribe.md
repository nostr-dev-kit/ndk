---
"@nostr-dev-kit/svelte": minor
---

Add meta-subscription support with $metaSubscribe

Introduces `ndk.$metaSubscribe()`, a reactive subscription that returns events pointed to by e-tags and a-tags, rather than the matching events themselves. Perfect for:

- Showing reposted content (kind 6/16)
- Finding articles commented on (kind 1111)
- Displaying zapped notes (kind 9735)
- Any use case where you want to follow event references

Supports multiple sort options:
- `time`: Sort by event creation time (newest first)
- `count`: Sort by number of pointers (most pointed-to first)
- `tag-time`: Sort by most recently tagged (newest pointer first)
- `unique-authors`: Sort by number of unique authors pointing to it

Example usage:
```typescript
const feed = ndk.$metaSubscribe(() => ({
  filters: [{ kinds: [6, 16], authors: $follows }],
  sort: 'tag-time'
}));

// Access pointed-to events
feed.events

// Access pointer events by target
feed.eventsTagging(event)
```
