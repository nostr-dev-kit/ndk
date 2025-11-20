# NDK-Svelte Development Guide

## Architecture Overview

NDK-svelte separates concerns into two layers:

1. **Builders** (Data Layer) - Live in `svelte/src/lib/builders/`
   - Reactive state factories exported from `@nostr-dev-kit/svelte`
   - Handle Nostr subscriptions, data fetching, caching, deduplication
   - Return objects with reactive getters using Svelte 5 runes
   - NO UI, NO opinions, pure data logic

2. **Components** (UI Layer) - Live in `svelte/registry/src/lib/ndk/`
   - Svelte components that copy into user projects via CLI (shadcn-style)
   - Use builders internally but add opinionated UI
   - Follow Root + Children pattern with context sharing
   - Users own the code and can customize freely

---

## When to Create Each

### Create a Builder When:
- You need to fetch/subscribe to Nostr data
- You're implementing reusable data logic (profiles, events, relays, etc.)
- The functionality should work with ANY UI
- You need reactive state management for Nostr operations
- You want lazy loading and automatic deduplication

### Create a Component When:
- You have a common UI pattern users will want
- You can compose it from existing builders
- It's customizable enough for different use cases
- It follows the Root + Children composability pattern

### Extract from Apps When:
- You notice you're implementing the same UI/logic in multiple places
- The functionality is generic enough for other Nostr apps
- You can separate the data logic (builder) from presentation (component)
- It doesn't contain app-specific business logic

---

## Creating Builders

### Builder Signature Pattern

**NEW in v3.0:** All builders follow a consistent signature pattern:

```typescript
// Pattern: create[Feature](config: () => Config, ndk?: NDKSvelte): State

export function createFeature(config: () => FeatureConfig, ndk?: NDKSvelte): FeatureState
export function createProfileFetcher(config: () => ProfileFetcherConfig, ndk?: NDKSvelte): ProfileFetcherState
export function createFollowAction(config: () => FollowActionConfig, ndk?: NDKSvelte): FollowActionState
```

**Config Interface Pattern** (NO `ndk` field):
```typescript
export interface FeatureConfig {
    event: NDKEvent;              // Direct values, not functions!
    user?: NDKUser;               // Direct values, not functions!
    showReplies?: boolean;        // Optional config
    // NO ndk field - it's a separate parameter!
}
```

**Key Changes from v2.x:**
- ✅ Config is now a **function**: `() => Config`
- ✅ NDK is **separate parameter**: `ndk?: NDKSvelte`
- ✅ Config values are **direct**: `event: NDKEvent` (not `event: () => NDKEvent`)
- ✅ NDK **auto-resolves from context** if not provided

> **Migration Status**: Some builders still use the old API. See `BUILDER_REFACTOR_PLAN.md` for progress.

**Return Shape Pattern:**
```typescript
export interface FeatureState {
    // Data fields
    data: YourData | null;

    // Status fields (common)
    loading: boolean;
    error: string | null;

    // Computed/derived fields
    count: number;

    // Methods (for actions)
    execute?: () => Promise<void>;
}

// Implementation returns object with getters:
return {
    get data() { return state.data; },
    get loading() { return state.loading; },
    get error() { return state.error; },
    get count() { return computed.count; },
    execute  // Methods don't need getters
};
```

**Key Rules:**
- ✅ Props use **functions** for reactive values: `event: () => NDKEvent`
- ✅ Return uses **getters** for reactive access: `get data() { return state.data; }`
- ✅ Export both the function AND TypeScript interfaces
- ❌ Never `event: NDKEvent` (not reactive)
- ❌ Never `return state` directly (not encapsulated)

**Why Config as Function?**
```typescript
let currentEvent = $state(event1);

// ❌ BAD - Not reactive
const card = createEventCard({ event: currentEvent }, ndk);
currentEvent = event2; // Builder won't update!

// ✅ GOOD - Reactive
const card = createEventCard(() => ({ event: currentEvent }), ndk);
currentEvent = event2; // Builder tracks change via $effect
```

**Why NDK from Context?**
```svelte
<!-- Set once in root layout -->
<script>
  import { setContext } from 'svelte';
  const ndk = createNDK({ /* ... */ });
  setContext('ndk', ndk);
</script>

<!-- Use anywhere without passing ndk -->
<script>
  // Auto-resolves from context!
  const card = createEventCard(() => ({ event }));
  const profile = createProfileFetcher(() => ({ user }));
</script>
```

**Why Getters for Return?**
```typescript
// Getters allow lazy evaluation and fine-grained reactivity
const card = createEventCard(() => ({ event }));

// This subscription only starts when you access the getter:
const count = card.replies.count; // ← Subscription starts here

// Not accessed = no subscription = better performance
```

### File Structure

Place builders in feature-based directories:
```
svelte/src/lib/builders/
├── profile/
│   └── index.svelte.ts          # Profile fetching logic
├── actions/
│   ├── follow-action.svelte.ts  # Follow/unfollow logic
│   ├── reaction-action.svelte.ts
│   └── index.ts                 # Exports all actions
├── event/
│   └── thread/
│       ├── index.svelte.ts
│       ├── types.ts
│       └── utils.ts
└── relay/
    ├── info.svelte.ts
    └── bookmarks.svelte.ts
```

### Builder Pattern Template

```typescript
// svelte/src/lib/builders/feature/index.svelte.ts
import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';
import type { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
import { resolveNDK } from '../resolve-ndk.svelte.js';

// 1. Define State Interface (what the builder returns)
export interface FeatureState {
    data: YourData | null;
    loading: boolean;
    error: string | null;
}

// 2. Define Config Interface (NO ndk field!)
export interface FeatureConfig {
    event: NDKEvent;           // Direct values
    user?: NDKUser;            // Direct values
    showDetails?: boolean;     // Optional config
}

// 3. Builder Function
/**
 * Description of what this builder does
 *
 * @param config - Function returning configuration
 * @param ndk - Optional NDK instance (uses context if not provided)
 *
 * @example
 * ```ts
 * // NDK from context
 * const feature = createFeature(() => ({ event }));
 *
 * // Or with explicit NDK
 * const feature = createFeature(() => ({ event }), customNDK);
 *
 * // Access reactive state
 * feature.data     // Your data
 * feature.loading  // Loading state
 * feature.error    // Error state
 * ```
 */
export function createFeature(
    config: () => FeatureConfig,
    ndk?: NDKSvelte
): FeatureState {
    // 4. Resolve NDK from parameter or context
    const resolvedNDK = resolveNDK(ndk);

    // 5. Create internal reactive state
    const state = $state<{
        data: YourData | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: false,
        error: null
    });

    // 6. Implement logic with $effect for reactivity
    $effect(() => {
        const { event, user, showDetails } = config();
        if (!event) return;

        // Your logic here
        fetchData(event);
    });

    async function fetchData(event: NDKEvent) {
        state.loading = true;
        try {
            // Use resolvedNDK methods directly - NO wrappers!
            const result = await resolvedNDK.fetchEvent(...);
            state.data = result;
        } catch (err) {
            state.error = err.message;
        } finally {
            state.loading = false;
        }
    }

    // 7. Return object with getters
    return {
        get data() {
            return state.data;
        },
        get loading() {
            return state.loading;
        },
        get error() {
            return state.error;
        }
    };
}
```

### Builder Patterns & Best Practices

#### Pattern 1: Lazy Subscriptions
Subscriptions should start only when getters are accessed:
```typescript
export function createEventCard(props: CreateEventCardProps) {
    let repliesSub = $state<Subscription | null>(null);

    // Getter triggers subscription
    const replies = $derived.by(() => {
        const currentEvent = props.event?.();
        if (!currentEvent?.id) return { count: 0, events: [] };

        // Subscribe on first access
        if (!repliesSub) {
            repliesSub = props.ndk.$subscribe(() => ({
                filters: [{ kinds: [1], "#e": [currentEvent.id] }]
            }));
        }

        return {
            count: repliesSub.events.size,
            events: Array.from(repliesSub.events)
        };
    });

    return {
        get replies() {
            return replies;
        }
    };
}
```

#### Pattern 2: Deduplication
Prevent duplicate requests using Maps:
```typescript
// Module-level cache
const inFlightRequests = new Map<string, Promise<NDKUserProfile | null>>();

export function createProfileFetcher(props: CreateProfileFetcherProps) {
    async function fetchProfile(user: NDKUser) {
        const pubkey = user.pubkey;

        // Check cache first
        if (user.profile) {
            return user.profile;
        }

        // Check in-flight requests
        let fetchPromise = inFlightRequests.get(pubkey);

        if (!fetchPromise) {
            fetchPromise = user.fetchProfile()
                .finally(() => inFlightRequests.delete(pubkey));
            inFlightRequests.set(pubkey, fetchPromise);
        }

        return await fetchPromise;
    }
    // ...
}
```

#### Pattern 3: $derived.by for Computed State
Use `$derived.by` when computation is non-trivial:
```typescript
const reactions = $derived.by((): EmojiReaction[] => {
    if (!reactionsSub) return [];

    const byEmoji = new Map<string, EmojiReaction>();

    for (const reaction of reactionsSub.events) {
        const emoji = reaction.content;
        const data = byEmoji.get(emoji) || {
            emoji,
            count: 0,
            hasReacted: false,
            pubkeys: []
        };

        data.count++;
        data.pubkeys.push(reaction.pubkey);

        if (reaction.pubkey === ndk.$currentPubkey) {
            data.hasReacted = true;
        }

        byEmoji.set(emoji, data);
    }

    return Array.from(byEmoji.values())
        .sort((a, b) => b.count - a.count);
});
```

#### Pattern 4: Action Builders
For user actions (follow, react, zap, etc.), provide async functions:
```typescript
export function createFollowAction(config: () => FollowActionConfig) {
    const isFollowing = $derived.by(() => {
        const { ndk, target } = config();
        if (!target) return false;

        if (typeof target === 'string') {
            // Hashtag follow
            const list = ndk.$sessionEvent<NDKInterestList>(NDKInterestList, { create: true });
            return list?.hasInterest(target.toLowerCase());
        }

        // User follow
        return ndk.$follows.has(target.pubkey);
    });

    async function toggle(): Promise<void> {
        const { ndk, target } = config();

        if (isFollowing) {
            await ndk.$follows.remove(target.pubkey);
        } else {
            await ndk.$follows.add(target.pubkey);
        }
    }

    return {
        get isFollowing() {
            return isFollowing;
        },
        toggle
    };
}
```

### Exporting Builders

#### 1. Export from feature index
```typescript
// svelte/src/lib/builders/actions/index.ts
export { createFollowAction, type FollowActionConfig } from './follow-action.svelte.js';
export { createReactionAction, type ReactionActionConfig } from './reaction-action.svelte.js';
```

#### 2. Add to main index
```typescript
// svelte/src/lib/index.ts
export {
    createFollowAction,
    createReactionAction,
    type FollowActionConfig,
    type ReactionActionConfig,
} from "./builders/actions/index.js";
```

### Builder Requirements

✅ **MUST:**
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`)
- Accept functions for reactive props: `event: () => NDKEvent`
- Return objects with getters: `get data() { return state.data; }`
- Use NDK methods directly - NO wrapper services
- Include JSDoc with @example
- Export TypeScript interfaces for props and return types
- Handle loading and error states
- Clean up subscriptions when inputs change

❌ **MUST NOT:**
- Include any UI/presentation logic
- Create wrapper services around NDK
- Maintain backwards compatibility (clean code only)
- Use `$props()` (builders are functions, not components)
- Export classes (export functions only)

---

## Creating Components

### File Structure

Components live in the registry with Root + Children pattern:
```
svelte/registry/src/lib/ndk/
├── event-card/
│   ├── context.svelte.ts          # Context type and key
│   ├── event-card-root.svelte     # Root (creates builder)
│   ├── event-card-header.svelte   # Child (uses context)
│   ├── event-card-content.svelte  # Child (uses context)
│   ├── event-card-actions.svelte  # Child (uses context)
│   ├── actions/                   # Nested action components
│   │   ├── reply-action.svelte
│   │   └── reaction-action.svelte
│   └── index.ts                   # Exports namespace
└── user-profile/
    ├── context.svelte.ts
    ├── user-profile-root.svelte
    ├── user-profile-avatar.svelte
    ├── user-profile-name.svelte
    └── index.ts
```

### Component Pattern Template

#### 1. Context File
```typescript
// context.svelte.ts
import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

export interface FeatureContext {
    ndk: NDKSvelte;
    event: NDKEvent;
    // Builder state if using one
    state?: FeatureState;
    // Any other shared props
    interactive: boolean;
}

export const FEATURE_CONTEXT_KEY = Symbol.for('feature-context');
```

#### 2. Root Component
```svelte
<!-- feature-root.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFeature } from '@nostr-dev-kit/svelte';
  import { FEATURE_CONTEXT_KEY, type FeatureContext } from './context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    interactive?: boolean;
    children: Snippet;
  }

  let {
    ndk,
    event,
    interactive = true,
    children
  }: Props = $props();

  // Create builder
  const state = createFeature(() => ({ event }), ndk);

  // Create context with getters (reactive)
  const context = {
    get ndk() { return ndk; },
    get event() { return event; },
    get state() { return state; },
    get interactive() { return interactive; }
  };

  setContext(FEATURE_CONTEXT_KEY, context);
</script>

<article class="feature-root">
  {@render children()}
</article>

<style>
  .feature-root {
    /* Base styles */
  }
</style>
```

#### 3. Child Component (Context Mode)
```svelte
<!-- feature-header.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { FEATURE_CONTEXT_KEY, type FeatureContext } from './context.svelte.js';

  // ✅ CORRECT: Keep context object (don't destructure!)
  const context = getContext<FeatureContext>(FEATURE_CONTEXT_KEY);
</script>

<header class="feature-header">
  <span>{context.state.data?.someField}</span>
</header>

<style>
  .feature-header {
    /* Styles */
  }
</style>
```

#### 4. Child Component (Standalone + Context)
```svelte
<!-- feature-name.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { FEATURE_CONTEXT_KEY, type FeatureContext } from './context.svelte.js';

  interface Props {
    // Optional - for standalone mode
    ndk?: NDKSvelte;
    user?: NDKUser;

    // Optional customization
    class?: string;
  }

  let {
    ndk: propNdk,
    user: propUser,
    class: className = ''
  }: Props = $props();

  // Try to get context (null if standalone)
  const context = getContext<FeatureContext | null>(
    FEATURE_CONTEXT_KEY,
    { optional: true }
  );

  // Resolve from props OR context
  const ndk = $derived(propNdk || context?.ndk);
  const user = $derived(propUser || context?.user);

  // Create builder if needed (only if not in context)
  const profileFetcher = $derived(
    user && ndk ? createProfileFetcher(() => ({ user }), ndk) : null
  );

  const profile = $derived(profileFetcher?.profile);
</script>

<span class="feature-name {className}">
  {profile?.displayName || 'Unknown'}
</span>

<style>
  .feature-name {
    /* Styles */
  }
</style>
```

#### 5. Index (Namespace Export)
```typescript
// index.ts
import Root from './feature-root.svelte';
import Header from './feature-header.svelte';
import Content from './feature-content.svelte';
import Actions from './feature-actions.svelte';

export const Feature = {
  Root,
  Header,
  Content,
  Actions,
};

export type { FeatureContext } from './context.svelte.js';
```

### Registering Components

Add to `svelte/registry/registry.json`:
```json
{
  "items": [
    {
      "name": "feature-card",
      "type": "registry:block",
      "title": "Feature Card",
      "description": "Composable feature card with Root, Header, Content, Actions",
      "registryDependencies": [],
      "dependencies": ["@nostr-dev-kit/ndk", "@nostr-dev-kit/svelte"],
      "files": [
        {
          "path": "registry/ndk/feature-card/context.svelte.ts",
          "type": "registry:lib"
        },
        {
          "path": "registry/ndk/feature-card/feature-card-root.svelte",
          "type": "registry:component"
        },
        {
          "path": "registry/ndk/feature-card/feature-card-header.svelte",
          "type": "registry:component"
        },
        {
          "path": "registry/ndk/feature-card/index.ts",
          "type": "registry:lib"
        }
      ]
    }
  ]
}
```

### Component Requirements

✅ **MUST:**
- Follow Root + Children pattern for composability
- Use builders for data logic (NO data fetching in components)
- **Use context with getters for reactivity (DO NOT destructure context!)**
- **Access context properties via `context.property` to maintain reactivity**
- Support standalone mode where it makes sense (Avatar, Name, etc.)
- Include meaningful CSS classes for customization
- Use Svelte 5 syntax (`$props()`, `$derived`, snippets)
- Include JSDoc comments describing usage

❌ **MUST NOT:**
- **Destructure context (breaks reactivity!)** - Use `const context = getContext(...)` not `const { prop } = getContext(...)`
- Implement data fetching logic (use builders)
- Create wrapper services
- Include app-specific business logic
- Use absolute positioning (unless necessary)
- Hard-code colors (use CSS variables)

---

## Extracting from Apps

### Step-by-Step Process

#### 1. Identify the Feature
Ask yourself:
- Is this used in multiple places?
- Is it generic enough for other Nostr apps?
- Can I separate data logic from UI?
- Does it fit NDK's scope?

#### 2. Extract Data Logic First (Builder)
```typescript
// IN YOUR APP (before extraction):
// component.svelte
<script>
  // ❌ Mixed data + UI logic
  let replies = $state([]);

  $effect(() => {
    const sub = ndk.subscribe({
      filters: [{ kinds: [1], "#e": [event.id] }]
    });

    sub.on('event', (e) => replies.push(e));
  });
</script>

// EXTRACT TO BUILDER:
// svelte/src/lib/builders/event/replies.svelte.ts
export function createReplies(props: CreateRepliesProps) {
    const repliesSub = $derived.by(() => {
        const e = props.event?.();
        if (!e?.id) return null;

        return props.ndk.$subscribe(() => ({
            filters: [{ kinds: [1], "#e": [e.id] }]
        }));
    });

    return {
        get count() {
            return repliesSub?.events.size ?? 0;
        },
        get events() {
            return Array.from(repliesSub?.events ?? []);
        }
    };
}
```

#### 3. Extract UI Second (Component)
```svelte
<!-- IN YOUR APP (before extraction): -->
<!-- Mixed with app-specific logic -->
<div class="app-specific-wrapper">
  <img src={profile.picture} />
  <h3>{profile.name}</h3>
  <!-- App-specific stuff -->
</div>

<!-- EXTRACT TO COMPONENT: -->
<!-- svelte/registry/src/lib/ndk/user-profile/user-profile-horizontal.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';

  const { state } = getContext<UserProfileContext>(USER_PROFILE_CONTEXT_KEY);
</script>

<!-- Generic, customizable UI -->
<div class="user-profile-horizontal">
  <img src={state.profile?.picture} alt="" class="avatar" />
  <div class="info">
    <h3>{state.profile?.displayName}</h3>
    <p>{state.profile?.about}</p>
  </div>
</div>

<style>
  /* Generic, customizable styles */
  .user-profile-horizontal {
    display: flex;
    gap: 1rem;
  }
</style>
```

#### 4. Remove App-Specific Logic
```typescript
// ❌ BAD - App-specific
export function createEventCard(props) {
    // App-specific navigation
    function navigateToEvent() {
        router.push(`/event/${event.id}`);
    }

    // App-specific auth check
    const canEdit = $derived(
        event.pubkey === currentUser?.id &&
        hasPermission('edit')
    );
}

// ✅ GOOD - Generic
export function createEventCard(props) {
    // Generic engagement data
    const replies = $derived.by(() => {
        const sub = reactionsSub;
        return {
            count: sub?.events.size ?? 0,
            events: Array.from(sub?.events ?? [])
        };
    });

    return {
        get replies() { return replies; }
    };
}
```

#### 5. Add Tests
```typescript
// svelte/src/lib/builders/feature/index.svelte.test.ts
import { describe, it, expect } from 'vitest';
import { createFeature } from './index.svelte.js';

describe('createFeature', () => {
    it('should fetch data when event changes', async () => {
        const feature = createFeature(() => ({
            event: sampleEvent
        }), ndk);

        expect(feature.loading).toBe(true);
        await waitFor(() => !feature.loading);
        expect(feature.data).toBeDefined();
    });
});
```

#### 6. Update Documentation
Add to `svelte/registry/src/routes/docs/builders/+page.svelte`:
```svelte
<p><code>createFeature(() => ({ event }), ndk)</code> - Brief description.</p>
<details>
  <summary>Show details</summary>
  <pre><code>{`const feature = createFeature(() => ({ event }), ndk);

feature.data    // Your data
feature.loading // Loading state`}</code></pre>
</details>
```

---

## Testing Requirements

### For Builders
```typescript
// Use Vitest with Svelte testing utils
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';

describe('createFeature', () => {
    it('should handle reactive input changes', async () => {
        let currentEvent = $state(event1);

        const feature = createFeature(() => ({
            event: currentEvent
        }), ndk);

        expect(feature.data.id).toBe(event1.id);

        currentEvent = event2;
        await waitFor(() => feature.data.id === event2.id);
    });

    it('should deduplicate requests', async () => {
        const spy = vi.spyOn(ndk, 'fetchEvent');

        const feature1 = createFeature(() => ({ event }), ndk);
        const feature2 = createFeature(() => ({ event }), ndk);

        await waitFor(() => !feature1.loading && !feature2.loading);

        // Should only fetch once
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
```

### For Components
```typescript
// Use Playwright for visual testing
import { test, expect } from '@playwright/test';

test('EventCard should display engagement metrics', async ({ page }) => {
    await page.goto('/components/event-card');

    const card = page.locator('[data-testid="event-card"]');
    await expect(card).toBeVisible();

    const replies = card.locator('[data-testid="reply-count"]');
    await expect(replies).toContainText('5 replies');
});
```

---

## Common Patterns

### Pattern: Composing Multiple Builders
```svelte
<script>
  import { createEventCard, createProfileFetcher } from '@nostr-dev-kit/svelte';

  const card = createEventCard(() => ({ event }), ndk);
  const profile = createProfileFetcher(() => ({ user: event.author }), ndk);
</script>

<article>
  <img src={profile.profile?.picture} alt="" />
  <h3>{profile.profile?.displayName}</h3>
  <p>{event.content}</p>
  <button>💬 {card.replies.count}</button>
</article>
```

### Pattern: Builder in Component Context
```svelte
<!-- Root creates builder once -->
<script lang="ts">
  import { setContext } from 'svelte';
  import { createEventCard } from '@nostr-dev-kit/svelte';

  const state = createEventCard(() => ({ event }), ndk);

  setContext(CONTEXT_KEY, {
    get state() { return state; }
  });
</script>

<!-- Children use context -->
<article>
  {@render children()}
</article>
```

### Pattern: Conditional Subscriptions
```typescript
// Only subscribe when accessing specific getters
export function createEventCard(props) {
    let repliesSub = $state<Subscription | null>(null);

    const replies = $derived.by(() => {
        const e = props.event?.();
        if (!e?.id) return { count: 0 };

        // Lazy: Create subscription on first access
        if (!repliesSub) {
            repliesSub = props.ndk.$subscribe(() => ({
                filters: [{ kinds: [1], "#e": [e.id] }]
            }));
        }

        return {
            count: repliesSub.events.size,
            events: Array.from(repliesSub.events)
        };
    });

    return {
        get replies() {
            return replies; // Subscription starts here
        }
    };
}
```

---

## Maintaining Consistency Across the Codebase

### CRITICAL: Inspect Existing Code After Creating New Functionality

When you create a new builder or component, you MUST inspect the existing codebase to ensure consistency and leverage opportunities:

#### After Creating a New Builder:

1. **Review all existing builders** in `src/lib/builders/`
   - Can any existing builders use this new builder internally?
   - Does this builder replace duplicated logic in other builders?
   - Should other builders be refactored to compose with this one?

2. **Review all registry components** in `registry/src/lib/ndk/`
   - Which components should use this new builder?
   - Are components implementing logic that this builder now provides?
   - Can you simplify existing components by using this builder?

**Example:**
```typescript
// You create createProfileFetcher builder

// MUST CHECK: Do any other builders fetch profiles?
// Before:
export function createEventCard(props) {
    // ❌ Duplicated profile fetching
    async function fetchAuthorProfile() {
        return await props.ndk.fetchProfile(event.author);
    }
}

// After: Refactor to use new builder
export function createEventCard(props) {
    // ✅ Use the new profile builder
    const authorProfile = createProfileFetcher(
        () => ({ user: props.event().author }),
        props.ndk
    );
}
```

#### After Creating a New Component:

1. **Review all existing components** in `registry/src/lib/ndk/`
   - Can other components compose with this new component?
   - Are there duplicated UI patterns this component could replace?
   - Should other components import and use parts of this component?

**Example:**
```svelte
<!-- You create UserProfile.Avatar component -->

<!-- MUST CHECK: Do other components render avatars? -->
<!-- Before: -->
<!-- event-card-header.svelte -->
<img src={profile?.picture} alt="" class="avatar" />

<!-- After: Refactor to use new component -->
<UserProfile.Avatar {ndk} user={event.author} size={40} />
```

#### After Creating a New Action Builder:

Action builders are especially important to check across the codebase:

```typescript
// You create createZapAction builder

// MUST CHECK ALL:
// 1. Other action builders (can they use zap logic?)
// 2. Event card components (should they show zap counts?)
// 3. Profile components (should they show user's zaps?)

// Example: Update event card to include zaps
export function createEventCard(props) {
    const replies = createReplyAction(...);
    const reactions = createReactionAction(...);
    const zaps = createZapAction(...); // ← Add new action

    return { replies, reactions, zaps };
}
```

### Where to Look

When you create new functionality, systematically check:

```bash
# After creating a builder:
1. src/lib/builders/**/*.ts        # Other builders
2. registry/src/lib/ndk/**/*.svelte # All components
3. src/lib/index.ts                 # Ensure exported

# After creating a component:
1. registry/src/lib/ndk/**/*.svelte # Other components
2. registry/registry.json           # Ensure registered
3. registry/src/routes/docs/**      # Update docs
```

### Why This Matters

- **Prevents duplication** - Don't have the same logic in multiple places
- **Ensures consistency** - All components/builders use the same patterns
- **Leverages improvements** - New optimizations benefit everything
- **Maintains quality** - Codebase stays clean and maintainable
- **Better UX** - Users get consistent behavior across all components

### Process Checklist

After creating new functionality:

1. ✅ Search for similar patterns in the codebase
2. ✅ Identify opportunities to refactor existing code
3. ✅ Update affected builders/components to use new functionality
4. ✅ Update tests for modified code
5. ✅ Update documentation to reflect changes
6. ✅ Verify no duplicated logic remains

**This is not optional.** Maintaining consistency is as important as creating the functionality itself.

---

## Checklist

### Before Submitting a Builder:
- [ ] Uses Svelte 5 runes (`$state`, `$derived`, `$effect`)
- [ ] Accepts functions for reactive props
- [ ] Returns object with getters
- [ ] Uses NDK methods directly (no wrappers)
- [ ] Includes JSDoc with examples
- [ ] Exports TypeScript interfaces
- [ ] Handles loading/error states
- [ ] Has tests
- [ ] Exported from `src/lib/index.ts`
- [ ] **Inspected existing builders to see if they can leverage this new functionality**
- [ ] **Inspected existing components to see if they should use this new builder**

### Before Submitting a Component:
- [ ] Follows Root + Children pattern
- [ ] Uses builders for data (no data fetching in component)
- [ ] Uses context with getters
- [ ] Supports standalone mode where appropriate
- [ ] Uses Svelte 5 syntax
- [ ] Has meaningful CSS classes
- [ ] Registered in `registry.json`
- [ ] Documented in docs pages
- [ ] No app-specific logic
- [ ] Uses CSS variables for theming
- [ ] **Inspected existing components to see if they can leverage this new functionality**

### Before Extracting from App:
- [ ] Identified reusable data logic
- [ ] Separated data (builder) from UI (component)
- [ ] Removed all app-specific logic
- [ ] Made it generic/configurable
- [ ] Added tests
- [ ] Updated documentation

---

## Anti-Patterns to Avoid

❌ **Destructuring Context (Breaks Reactivity!)**
```svelte
<!-- BAD - Context values won't update -->
<script>
  const { event, ndk } = getContext(KEY);
  // When parent's event prop changes, this component won't see it!
</script>
<div>{event.content}</div>

<!-- GOOD - Context values stay reactive -->
<script>
  const context = getContext(KEY);
  // Getters run each time, always fresh data
</script>
<div>{context.event.content}</div>
```

**Why?** Destructuring captures values at that moment. The context object uses getters, which need to be called each time to get fresh values. See ARCHITECTURE.md for detailed explanation.

❌ **Creating Wrapper Services**
```typescript
// BAD
class EventService {
    async publishEvent(content: string) {
        const event = new NDKEvent(this.ndk);
        event.content = content;
        return await event.publish();
    }
}

// GOOD - Just use NDK directly
const event = new NDKEvent(ndk);
event.content = content;
await event.publish();
```

❌ **Data Fetching in Components**
```svelte
<!-- BAD -->
<script>
  let profile = $state(null);

  $effect(() => {
    ndk.fetchProfile(user.pubkey).then(p => profile = p);
  });
</script>

<!-- GOOD - Use builder -->
<script>
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';

  const profileFetcher = createProfileFetcher(() => ({ user }), ndk);
</script>
<span>{profileFetcher.profile?.name}</span>
```

❌ **Non-Reactive Props**
```typescript
// BAD - Won't react to changes
export function createFeature(props: { event: NDKEvent }) {
    // Props are static!
}

// GOOD - Reactive
export function createFeature(props: { event: () => NDKEvent }) {
    $effect(() => {
        const e = props.event(); // Tracks changes
    });
}
```

❌ **Backwards Compatibility Code**
```typescript
// BAD - Never do this
export function createFeature(props: FeatureProps) {
    // Support old API
    if ('eventId' in props) {
        console.warn('eventId is deprecated, use event instead');
        // ... compatibility shim
    }
}

// GOOD - Clean, modern only
export function createFeature(props: FeatureProps) {
    const e = props.event();
    // Just the new way
}
```

---

## Questions?

When in doubt:
1. Look at existing builders in `src/lib/builders/`
2. Look at existing components in `registry/src/lib/ndk/`
3. Check the docs in `registry/src/routes/docs/`
4. Ask: "Does this belong in NDK or is it app-specific?"
5. Remember: Data in builders, UI in components, NO wrappers, NO backwards compatibility
