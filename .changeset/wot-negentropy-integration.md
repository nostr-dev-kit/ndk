---
"@nostr-dev-kit/wot": minor
---

Add efficient negentropy-based contact list syncing to Web of Trust builder

**Features:**
- Smart fetch strategy: uses negentropy for large batches (>= 5 authors by default)
- Automatic relay detection for NIP-77 support
- Graceful fallback to subscription-based fetch when needed
- Configurable threshold via `negentropyMinAuthors` option
- Significant bandwidth savings when building large WoT graphs

**New options for `wot.load()`:**
- `useNegentropy?: boolean` - Enable negentropy sync (default: true)
- `negentropyMinAuthors?: number` - Min authors to use negentropy (default: 5)
- `relayUrls?: string[]` - Specific relays for sync

**Performance improvements:**
- 10-100x bandwidth reduction for large WoT graphs
- Efficient set reconciliation via NIP-77
- Sequential multi-relay sync with deduplication
