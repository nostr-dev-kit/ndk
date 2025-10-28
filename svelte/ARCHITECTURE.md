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

## Builder Signature Pattern

**NEW in v3.0 - All builders follow this pattern:**

```typescript
// Signature: create[Feature](config: () => Config, ndk?: NDKSvelte): State
export function createFeature(config: () => FeatureConfig, ndk?: NDKSvelte): FeatureState

// Config: NO ndk field, direct values
export interface FeatureConfig {
    event: NDKEvent;          // Direct value (not function!)
    user?: NDKUser;           // Direct value (not function!)
    showDetails?: boolean;    // Optional config
}

// Return: Object with getters
export interface FeatureState {
    data: Data | null;        // Data fields
    loading: boolean;         // Status fields
    count: number;            // Computed fields
    execute?: () => Promise<void>; // Methods
}

// Implementation
import { resolveNDK } from '../resolve-ndk.svelte.js';

export function createFeature(config: () => FeatureConfig, ndk?: NDKSvelte) {
    const resolvedNDK = resolveNDK(ndk); // Auto-resolves from context

    $effect(() => {
        const { event } = config(); // Reactive tracking
        // use resolvedNDK and config
    });

    return {
        get data() { return state.data; },     // ← Getter!
        get loading() { return state.loading; } // ← Getter!
    };
}
```

**Why?**
- Config is function → Reactive tracking with `$effect`
- NDK separate param → Auto-resolves from Svelte context
- Return has getters → Lazy evaluation + fine-grained reactivity

**Usage:**
```typescript
// Most common - NDK from context
const card = createEventCard(() => ({ event }));

// Override when needed
const card = createEventCard(() => ({ event }), customNDK);
```

## Builder Template (Copy & Modify)

```typescript
// src/lib/builders/[feature]/index.svelte.ts
import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';
import { resolveNDK } from '../resolve-ndk.svelte.js';

export interface FeatureState {
    data: Data | null;
    loading: boolean;
}

export interface FeatureConfig {
    target: Target;  // Direct value!
    // NO ndk field
}

export function createFeature(
    config: () => FeatureConfig,
    ndk?: NDKSvelte
): FeatureState {
    const resolvedNDK = resolveNDK(ndk); // Auto-resolve
    const state = $state({ data: null, loading: false });

    $effect(() => {
        const { target } = config(); // Track changes
        fetchData(target);
    });

    async function fetchData(target: Target) {
        state.loading = true;
        state.data = await resolvedNDK.fetchSomething(target);
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

  // ✅ CORRECT: Keep context object (don't destructure!)
  const context = getContext<FeatureContext>(FEATURE_CONTEXT_KEY);
</script>

<div class="feature-display">
  {#if context.state.loading}
    Loading...
  {:else}
    {context.state.data}
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

## Key Patterns Summary

### Builder Signature (v3.0)
```typescript
create[Feature](config: () => Config, ndk?: NDKSvelte): State
```
- **Config:** Function returning object with direct values (`event: NDKEvent`)
- **NDK:** Optional parameter, auto-resolves from context
- **Return:** Object with getters (`get data() { return state.data; }`)
- **Interfaces:** Export `[Feature]Config` and `[Feature]State`

### Component Pattern
```svelte
<!-- Root: Creates builder, sets context -->
<Feature.Root> → createFeature() → setContext()

<!-- Children: Get context, render UI -->
<Feature.Display> → getContext() → render
```

## Key Rules

### Builders MUST:
- ✅ Use `$state`, `$derived`, `$effect`
- ✅ Accept config function: `config: () => Config`
- ✅ Use `resolveNDK(ndk)` to get NDK instance
- ✅ Return getters: `get data() { return state.data; }`
- ✅ Use NDK directly - NO wrappers
- ✅ Export TypeScript types
- ❌ NO `ndk` in config interface
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

## CRITICAL: Maintaining Consistency

**After creating ANY new builder or component, you MUST:**

### New Builder Created → Check:
```bash
# 1. Can other builders use it?
grep -r "similar pattern" src/lib/builders/

# 2. Should components use it?
grep -r "similar pattern" registry/src/lib/ndk/

# 3. Refactor duplicated logic
# Example: New createProfileFetcher
# → Update all builders that fetch profiles
# → Update all components that fetch profiles
```

### New Component Created → Check:
```bash
# 1. Can other components compose with it?
find registry/src/lib/ndk -name "*.svelte"

# 2. Are there duplicated UI patterns?
# Example: New UserProfile.Avatar
# → Update all components that render avatars
# → Replace <img> tags with <UserProfile.Avatar>
```

### Why This Matters:
- Prevents code duplication
- Ensures consistent behavior
- Leverages improvements everywhere
- **This is not optional**

---

## Export Checklist

### New Builder:
1. Create in `src/lib/builders/[feature]/`
2. Export from `src/lib/builders/[feature]/index.ts`
3. Add to `src/lib/index.ts`
4. Add tests in `*.svelte.test.ts`
5. Document in `registry/src/routes/docs/builders/+page.svelte`
6. **Inspect all existing builders - can they use this?**
7. **Inspect all existing components - should they use this?**
8. **Refactor any duplicated logic to use this new builder**

### New Component:
1. Create in `registry/src/lib/ndk/[feature]/`
2. Create `context.svelte.ts`
3. Create Root + Children components
4. Create `index.ts` with namespace export
5. Add to `registry/registry.json`
6. Document in `registry/src/routes/docs/components/+page.svelte`
7. **Inspect all existing components - can they compose with this?**
8. **Refactor any duplicated UI patterns to use this new component**

## Anti-Patterns

```typescript
// ❌ BAD: Destructuring context (breaks reactivity!)
<script>
  const { event, ndk } = getContext(EVENT_CARD_CONTEXT_KEY);
  // When event prop changes in root, this won't update!
</script>

// ✅ GOOD: Keep context object
<script>
  const context = getContext(EVENT_CARD_CONTEXT_KEY);
  // Access via context.event - getters run each time
</script>

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

## CRITICAL: Reactive Context Pattern

### Why Context Must Use Getters

When sharing data through Svelte context, **you MUST use getters** in the context object and **MUST NOT destructure** when consuming it. This is essential for reactivity.

**The Problem:**
```svelte
<!-- Root sets context with getters ✅ -->
<script>
  let event = $props().event;

  setContext(KEY, {
    get event() { return event; }  // Getter
  });
</script>

<!-- Child destructures context ❌ WRONG! -->
<script>
  const { event } = getContext(KEY);
  // event is now a SNAPSHOT - won't update when parent's event changes!
</script>

<div>{event.content}</div>  <!-- Stale data! -->
```

**The Solution:**
```svelte
<!-- Child keeps context object ✅ CORRECT! -->
<script>
  const context = getContext(KEY);
  // context.event runs the getter each time
</script>

<div>{context.event.content}</div>  <!-- Always fresh! -->
```

### Why Destructuring Breaks Reactivity

When you destructure, JavaScript **captures the value at that moment**:

```typescript
const context = { get value() { return someState } };

// Destructuring captures current value
const { value } = context;  // ❌ value is now frozen

// Accessing through object runs getter
context.value;  // ✅ Runs getter, gets fresh value
```

### Pattern: Use $derived for Derived Values

If you need to derive values from context, use `$derived`:

```svelte
<script>
  const context = getContext(KEY);

  // ✅ Reactive derived value
  const displayName = $derived(
    context.event.author?.profile?.displayName || 'Unknown'
  );
</script>

<div>{displayName}</div>
```

### Performance: Getters Are Fast

**Getters have minimal overhead:**
- Modern JavaScript engines optimize property access
- Svelte 5's fine-grained reactivity only updates what changed
- No performance penalty compared to direct property access

**From community research (2024-2025):**
- Svelte 5 uses **Proxies** for state, which are highly optimized
- Getter pattern is **standard practice** for reactive contexts
- Comparable performance to direct property access in modern engines

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
