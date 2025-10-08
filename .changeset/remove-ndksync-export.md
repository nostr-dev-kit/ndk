---
"@nostr-dev-kit/sync": minor
"@nostr-dev-kit/wot": patch
---

Remove ndkSync function from public API - use NDKSync class instead

**BREAKING**: The low-level `ndkSync` function is no longer exported. All packages should use the `NDKSync` class which provides:
- Automatic relay capability caching
- Fallback to fetchEvents for non-negentropy relays
- Proper error handling and retry logic

**Migration**:
```typescript
// Before
import { ndkSync } from "@nostr-dev-kit/sync";
const result = await ndkSync.call(ndk, filters, opts);

// After
import { NDKSync } from "@nostr-dev-kit/sync";
const result = await NDKSync.sync(ndk, filters, opts);
```

Updated wot package to use NDKSync, removing duplicate relay filtering logic.
