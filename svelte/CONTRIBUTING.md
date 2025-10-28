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

// 1. Define State Interface (what the builder returns)
export interface FeatureState {
    data: YourData | null;
    loading: boolean;
    error: string | null;
}

// 2. Define Props Interface (configuration)
export interface CreateFeatureProps {
    ndk: NDKSvelte;
    // Use FUNCTIONS for reactive inputs
    event?: () => NDKEvent | undefined;
    user?: () => NDKUser | undefined;
}

// 3. Builder Function
/**
 * Description of what this builder does
 *
 * @example
 * ```ts
 * const feature = createFeature({ ndk, event: () => event });
 *
 * // Access reactive state
 * feature.data     // Your data
 * feature.loading  // Loading state
 * feature.error    // Error state
 * ```
 */
export function createFeature(props: CreateFeatureProps): FeatureState {
    // 4. Create internal reactive state
    const state = $state<{
        data: YourData | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: false,
        error: null
    });

    // 5. Implement logic with $effect for reactivity
    $effect(() => {
        const currentEvent = props.event?.();
        if (!currentEvent) return;

        // Your logic here
        fetchData(currentEvent);
    });

    async function fetchData(event: NDKEvent) {
        state.loading = true;
        try {
            // Use NDK methods directly - NO wrappers!
            const result = await props.ndk.fetchEvent(...);
            state.data = result;
        } catch (err) {
            state.error = err.message;
        } finally {
            state.loading = false;
        }
    }

    // 6. Return object with getters
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
            const list = ndk.$sessionEvent<NDKInterestList>(NDKInterestList);
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
  const state = createFeature({ ndk, event: () => event });

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

  const { ndk, event, state } = getContext<FeatureContext>(FEATURE_CONTEXT_KEY);
</script>

<header class="feature-header">
  <span>{state.data?.someField}</span>
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
    user && ndk ? createProfileFetcher({ ndk, user: () => user }) : null
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
- Use context with getters for reactivity
- Support standalone mode where it makes sense (Avatar, Name, etc.)
- Include meaningful CSS classes for customization
- Use Svelte 5 syntax (`$props()`, `$derived`, snippets)
- Include JSDoc comments describing usage

❌ **MUST NOT:**
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
        const feature = createFeature({
            ndk,
            event: () => sampleEvent
        });

        expect(feature.loading).toBe(true);
        await waitFor(() => !feature.loading);
        expect(feature.data).toBeDefined();
    });
});
```

#### 6. Update Documentation
Add to `svelte/registry/src/routes/docs/builders/+page.svelte`:
```svelte
<p><code>createFeature({ ndk, event })</code> - Brief description.</p>
<details>
  <summary>Show details</summary>
  <pre><code>{`const feature = createFeature({ ndk, event: () => event });

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

        const feature = createFeature({
            ndk,
            event: () => currentEvent
        });

        expect(feature.data.id).toBe(event1.id);

        currentEvent = event2;
        await waitFor(() => feature.data.id === event2.id);
    });

    it('should deduplicate requests', async () => {
        const spy = vi.spyOn(ndk, 'fetchEvent');

        const feature1 = createFeature({ ndk, event: () => event });
        const feature2 = createFeature({ ndk, event: () => event });

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

  const card = createEventCard({ ndk, event: () => event });
  const profile = createProfileFetcher({ ndk, user: () => event.author });
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

  const state = createEventCard({ ndk, event: () => event });

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

### Before Extracting from App:
- [ ] Identified reusable data logic
- [ ] Separated data (builder) from UI (component)
- [ ] Removed all app-specific logic
- [ ] Made it generic/configurable
- [ ] Added tests
- [ ] Updated documentation

---

## Anti-Patterns to Avoid

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

  const profileFetcher = createProfileFetcher({ ndk, user: () => user });
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
