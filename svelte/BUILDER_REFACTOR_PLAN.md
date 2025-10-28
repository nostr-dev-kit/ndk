# Builder API Refactor Plan

## Goal
Make all builders consistent with a cleaner API that auto-resolves NDK from context.

## New Signature Pattern

```typescript
createX(config: () => Config, ndk?: NDKSvelte): State
```

### Usage Examples

```typescript
// Most common - NDK from context
const card = createEventCard(() => ({ event }));

// Override with explicit NDK
const card = createEventCard(() => ({ event }), customNDK);

// With multiple config values
const card = createEventCard(() => ({
  event,
  showReplies: true,
  maxDepth: 3
}));
```

## Implementation Approach

### 1. Create NDK Resolution Utility

```typescript
// src/lib/builders/resolve-ndk.svelte.ts
import { getContext, hasContext } from 'svelte';
import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';

export const NDK_CONTEXT_KEY = 'ndk';

/**
 * Resolves NDK from explicit parameter or Svelte context
 *
 * @param providedNDK - Optional explicit NDK instance
 * @returns NDK instance
 * @throws Error if NDK not found in either source
 */
export function resolveNDK(providedNDK?: NDKSvelte): NDKSvelte {
  // Explicit NDK takes precedence
  if (providedNDK) return providedNDK;

  // Try to get from context (only works during component initialization)
  try {
    if (hasContext(NDK_CONTEXT_KEY)) {
      const contextNDK = getContext<NDKSvelte>(NDK_CONTEXT_KEY);
      if (contextNDK) return contextNDK;
    }
  } catch {
    // getContext called outside component initialization - that's ok
  }

  throw new Error(
    'NDK not found: provide as second parameter or set in Svelte context with setContext("ndk", ndk)'
  );
}
```

### 2. Update Builder Pattern

**Before (inconsistent):**
```typescript
// Actions
export function createFollowAction(config: () => FollowActionConfig) {
  const { ndk, target } = config();
}

// Data builders
export function createProfileFetcher(props: CreateProfileFetcherProps) {
  // props: { ndk: NDKSvelte, user: () => NDKUser }
}
```

**After (consistent):**
```typescript
import { resolveNDK } from '../resolve-ndk.svelte.js';

export interface EventCardConfig {
  event: NDKEvent;
  showReplies?: boolean;
  maxDepth?: number;
  // NO ndk in config!
}

export function createEventCard(
  config: () => EventCardConfig,
  ndk?: NDKSvelte
) {
  // Resolve NDK once at initialization
  const resolvedNDK = resolveNDK(ndk);

  // Access config reactively
  $effect(() => {
    const { event, showReplies, maxDepth } = config();
    // Use resolvedNDK and config values
  });

  return {
    get replies() { /* ... */ }
  };
}
```

## Benefits

### 1. Cleaner API
```typescript
// Before
createEventCard({ ndk, event: () => event })

// After
createEventCard(() => ({ event }))
```

### 2. Less Boilerplate
Apps set NDK once in root layout:
```svelte
<script>
  import { setContext } from 'svelte';

  const ndk = createNDK({ /* ... */ });
  setContext('ndk', ndk);
</script>
```

Then all builders work without passing NDK:
```svelte
<script>
  const card = createEventCard(() => ({ event }));
  const profile = createProfileFetcher(() => ({ user }));
  const followAction = createFollowAction(() => ({ target }));
</script>
```

### 3. Still Flexible
Can override when needed:
```typescript
// Use different NDK instance
const card = createEventCard(() => ({ event }), readOnlyNDK);

// Testing with mock NDK
const card = createEventCard(() => ({ event }), mockNDK);
```

### 4. Consistent Pattern
All builders follow the same signature:
```typescript
createX(config: () => Config, ndk?: NDKSvelte)
```

## Migration Strategy

### Phase 1: Create Infrastructure
1. Create `src/lib/builders/resolve-ndk.svelte.ts`
2. Add tests for `resolveNDK`
3. Export from `src/lib/index.ts`

### Phase 2: Migrate Builders (one at a time)
1. Actions (already close to this pattern)
   - `createFollowAction`
   - `createReactionAction`
   - `createReplyAction`
   - `createRepostAction`
   - `createMuteAction`
   - `createZapAction`

2. Data builders
   - `createProfileFetcher`
   - `createEventContent`
   - `createEmbeddedEvent`
   - `createThreadView`
   - `createRelayInfo`
   - `createBookmarkedRelayList`

### Phase 3: Update Documentation
1. Update `CONTRIBUTING.md` with new pattern
2. Update `ARCHITECTURE.md` with new signature
3. Add migration guide for existing code

### Phase 4: Update Registry Components
Update all components to use new builder API

## Example Migration

### Before: createProfileFetcher

```typescript
export interface CreateProfileFetcherProps {
  ndk: NDKSvelte;
  user: () => (NDKUser | string);
}

export function createProfileFetcher(props: CreateProfileFetcherProps) {
  const state = $state({ profile: null, loading: false });

  $effect(() => {
    const currentUser = props.user();
    fetchProfile(currentUser);
  });

  async function fetchProfile(payload: NDKUser | string) {
    const profile = await props.ndk.fetchProfile(payload);
    // ...
  }

  return {
    get profile() { return state.profile; }
  };
}

// Usage:
createProfileFetcher({ ndk, user: () => user })
```

### After: createProfileFetcher

```typescript
import { resolveNDK } from '../resolve-ndk.svelte.js';

export interface ProfileFetcherConfig {
  user: NDKUser | string;
}

export function createProfileFetcher(
  config: () => ProfileFetcherConfig,
  ndk?: NDKSvelte
) {
  const resolvedNDK = resolveNDK(ndk);
  const state = $state({ profile: null, loading: false });

  $effect(() => {
    const { user } = config();
    fetchProfile(user);
  });

  async function fetchProfile(payload: NDKUser | string) {
    const profile = await resolvedNDK.fetchProfile(payload);
    // ...
  }

  return {
    get profile() { return state.profile; }
  };
}

// Usage:
createProfileFetcher(() => ({ user }))
// or
createProfileFetcher(() => ({ user }), customNDK)
```

## Breaking Changes

This is a **breaking change** for v3.0, which is acceptable since it's a major version.

**Old code:**
```typescript
createEventCard({ ndk, event: () => event })
```

**New code:**
```typescript
createEventCard(() => ({ event }))
// or
createEventCard(() => ({ event }), ndk)
```

## Type Safety Benefits

```typescript
// Before - easy to forget () around event
createEventCard({ ndk, event: myEvent }) // Compiles but breaks reactivity!

// After - TypeScript enforces the function
createEventCard(() => ({ event: myEvent })) // Correct
createEventCard({ event: myEvent }) // Type error - must be function
```

## Testing Considerations

Tests can pass mock NDK explicitly:
```typescript
describe('createEventCard', () => {
  it('should fetch replies', () => {
    const mockNDK = createMockNDK();
    const card = createEventCard(() => ({ event }), mockNDK);

    expect(card.replies.count).toBe(0);
  });
});
```

## Questions to Consider

1. **Context key**: Use `'ndk'` string or Symbol?
   - Recommend: String `'ndk'` for simplicity (already convention)

2. **Error handling**: Should `resolveNDK` throw or return undefined?
   - Recommend: Throw with helpful message

3. **Backwards compatibility**: Support old API?
   - Recommend: No, clean break for v3.0

4. **getContext timing**: What if builder called outside component init?
   - Recommend: Require explicit NDK parameter in that case

## Implementation Order

1. ✅ Create `resolve-ndk.svelte.ts`
2. ✅ Add tests
3. ✅ Migrate one action builder as proof of concept
4. ✅ Migrate remaining action builders
5. ✅ Migrate data builders
6. ✅ Update all components
7. ✅ Update documentation
8. ✅ Update examples

## Documentation Update Required

Update signature pattern to:

```typescript
// Standard signature for ALL builders
createX(config: () => Config, ndk?: NDKSvelte): State

// Config interface (NO ndk field)
export interface FeatureConfig {
  event: NDKEvent;
  // ... other config
}

// Usage
const feature = createFeature(() => ({ event }));
```
