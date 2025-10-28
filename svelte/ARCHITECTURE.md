# NDK-Svelte Architecture Quick Reference

## Two-Layer System

```
┌─────────────────────────────────────────────────────┐
│  COMPONENTS (UI Layer)                              │
│  registry/src/lib/ndk/*                             │
│  - Svelte files that copy to user projects          │
│  - Root + Children pattern                          │
│  - Uses context for composition                     │
│  - User owns and customizes                         │
└────────────────┬────────────────────────────────────┘
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────┐
│  BUILDERS (Data Layer)                              │
│  src/lib/builders/*                                 │
│  - Reactive state factories                         │
│  - Exports from @nostr-dev-kit/svelte               │
│  - No UI, pure data logic                           │
│  - Handles subscriptions, fetching, caching         │
└─────────────────────────────────────────────────────┘
```

## Builder Template (Copy & Modify)

```typescript
// src/lib/builders/[feature]/index.svelte.ts
import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';

export interface FeatureState {
    data: Data | null;
    loading: boolean;
}

export interface CreateFeatureProps {
    ndk: NDKSvelte;
    target: () => Target; // ← Function for reactivity
}

export function createFeature(props: CreateFeatureProps): FeatureState {
    const state = $state({ data: null, loading: false });

    $effect(() => {
        const t = props.target(); // Track changes
        fetchData(t);
    });

    async function fetchData(target: Target) {
        state.loading = true;
        state.data = await props.ndk.fetchSomething(target);
        state.loading = false;
    }

    return {
        get data() { return state.data; },
        get loading() { return state.loading; }
    };
}
```

## Component Template (Copy & Modify)

### context.svelte.ts
```typescript
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

export interface FeatureContext {
    ndk: NDKSvelte;
    state: FeatureState;
}

export const FEATURE_CONTEXT_KEY = Symbol.for('feature');
```

### feature-root.svelte
```svelte
<script lang="ts">
  import { setContext } from 'svelte';
  import { createFeature } from '@nostr-dev-kit/svelte';
  import { FEATURE_CONTEXT_KEY } from './context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    ndk: NDKSvelte;
    target: Target;
    children: Snippet;
  }

  let { ndk, target, children }: Props = $props();

  const state = createFeature({ ndk, target: () => target });

  setContext(FEATURE_CONTEXT_KEY, {
    get ndk() { return ndk; },
    get state() { return state; }
  });
</script>

<div class="feature-root">
  {@render children()}
</div>
```

### feature-display.svelte
```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import { FEATURE_CONTEXT_KEY, type FeatureContext } from './context.svelte.js';

  const { state } = getContext<FeatureContext>(FEATURE_CONTEXT_KEY);
</script>

<div class="feature-display">
  {#if state.loading}
    Loading...
  {:else}
    {state.data}
  {/if}
</div>
```

### index.ts
```typescript
import Root from './feature-root.svelte';
import Display from './feature-display.svelte';

export const Feature = { Root, Display };
export type { FeatureContext } from './context.svelte.js';
```

## Key Rules

### Builders MUST:
- ✅ Use `$state`, `$derived`, `$effect`
- ✅ Accept functions: `event: () => NDKEvent`
- ✅ Return getters: `get data() { return state.data; }`
- ✅ Use NDK directly - NO wrappers
- ✅ Export TypeScript types
- ❌ NO UI code
- ❌ NO backwards compatibility

### Components MUST:
- ✅ Follow Root + Children pattern
- ✅ Use builders for data
- ✅ Share via context with getters
- ✅ Use Svelte 5 syntax
- ❌ NO data fetching in components
- ❌ NO app-specific logic

## File Locations

```
svelte/
├── src/lib/
│   ├── builders/              ← Builders go here
│   │   ├── profile/
│   │   │   └── index.svelte.ts
│   │   ├── actions/
│   │   │   ├── follow-action.svelte.ts
│   │   │   └── index.ts
│   │   └── event/
│   │       └── thread/
│   └── index.ts              ← Export builders here
│
└── registry/
    ├── src/lib/ndk/          ← Components go here
    │   ├── event-card/
    │   │   ├── context.svelte.ts
    │   │   ├── event-card-root.svelte
    │   │   ├── event-card-header.svelte
    │   │   └── index.ts
    │   └── user-profile/
    └── registry.json         ← Register components here
```

## Common Patterns

### Lazy Subscription
```typescript
const data = $derived.by(() => {
    const target = props.target();
    if (!target) return null;

    // Subscribe only when getter accessed
    const sub = props.ndk.$subscribe(() => ({
        filters: [/* ... */]
    }));

    return sub.events;
});
```

### Deduplication
```typescript
const cache = new Map<string, Promise<Data>>();

async function fetch(id: string) {
    if (cache.has(id)) return cache.get(id);

    const promise = ndk.fetchData(id)
        .finally(() => cache.delete(id));

    cache.set(id, promise);
    return promise;
}
```

### Action Builder
```typescript
export function createAction(config: () => Config) {
    const state = $derived.by(() => {
        const { ndk, target } = config();
        return computeState(ndk, target);
    });

    async function execute() {
        const { ndk, target } = config();
        await ndk.performAction(target);
    }

    return {
        get state() { return state; },
        execute
    };
}
```

### Standalone + Context Component
```svelte
<script lang="ts">
  import { getContext } from 'svelte';

  interface Props {
    ndk?: NDKSvelte;
    data?: Data;
  }

  let { ndk: propNdk, data: propData }: Props = $props();

  const context = getContext<Context | null>(KEY, { optional: true });

  // Resolve from props OR context
  const ndk = $derived(propNdk || context?.ndk);
  const data = $derived(propData || context?.data);
</script>

<div>{data}</div>
```

## Export Checklist

### New Builder:
1. Create in `src/lib/builders/[feature]/`
2. Export from `src/lib/builders/[feature]/index.ts`
3. Add to `src/lib/index.ts`
4. Add tests in `*.svelte.test.ts`
5. Document in `registry/src/routes/docs/builders/+page.svelte`

### New Component:
1. Create in `registry/src/lib/ndk/[feature]/`
2. Create `context.svelte.ts`
3. Create Root + Children components
4. Create `index.ts` with namespace export
5. Add to `registry/registry.json`
6. Document in `registry/src/routes/docs/components/+page.svelte`

## Anti-Patterns

```typescript
// ❌ BAD: Wrapper services
class EventService {
    publish(content) { /* ... */ }
}

// ✅ GOOD: Use NDK directly
const event = new NDKEvent(ndk);
await event.publish();

// ❌ BAD: Non-reactive props
function create(props: { event: NDKEvent }) {}

// ✅ GOOD: Function props
function create(props: { event: () => NDKEvent }) {}

// ❌ BAD: Data fetching in component
<script>
  $effect(() => {
    ndk.fetch(...).then(data => ...);
  });
</script>

// ✅ GOOD: Use builder
<script>
  const state = createBuilder({ ndk, ... });
</script>

// ❌ BAD: Backwards compatibility
if ('oldProp' in props) { /* shim */ }

// ✅ GOOD: Clean, modern only
const value = props.newProp();
```

## Decision Tree

```
New functionality needed?
│
├─ Is it data/subscription logic?
│  └─ → Create BUILDER in src/lib/builders/
│
├─ Is it reusable UI?
│  └─ → Create COMPONENT in registry/src/lib/ndk/
│
├─ Is it app-specific?
│  └─ → Keep in YOUR app, don't add to NDK
│
└─ Extracting from app?
   ├─ Separate data logic → BUILDER
   ├─ Separate UI → COMPONENT
   └─ Remove app-specific code
```

## Usage Examples

### Using Builder Directly (Custom UI)
```svelte
<script>
  import { createEventCard } from '@nostr-dev-kit/svelte';

  const card = createEventCard({ ndk, event: () => event });
</script>

<!-- Your custom UI -->
<div class="my-design">
  <p>{event.content}</p>
  <span>{card.replies.count} replies</span>
  <span>{card.zaps.totalAmount} sats</span>
</div>
```

### Using Component (Pre-built UI)
```svelte
<script>
  import { EventCard } from '$lib/components/ui/event-card';
</script>

<!-- Composable pre-built UI -->
<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</EventCard.Root>
```

### Mixing Both
```svelte
<script>
  import { EventCard } from '$lib/components/ui/event-card';
  import { createZapAction } from '@nostr-dev-kit/svelte';

  const zapAction = createZapAction(() => ({ ndk, event }));
</script>

<!-- Use component parts + custom builder -->
<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />

  <!-- Custom action using builder -->
  <button onclick={() => zapAction.zap(1000)}>
    ⚡ Zap {zapAction.stats.totalAmount} sats
  </button>
</EventCard.Root>
```
