# svelte Design Philosophy

## Vision

Build the most elegant, performant, and delightful Nostr library for Svelte 5 - one that makes developers smile.

## Core Principles

### 1. Svelte 5 Native

**Embrace runes, don't fight them.**

Svelte 5 introduces a new reactive paradigm. We don't wrap it or hide it - we celebrate it.

```svelte
<!-- Beautiful, native Svelte 5 -->
<script lang="ts">
const notes = ndk.$subscribe([{ kinds: [1] }]);
</script>

{#each notes.events as note}
  {note.content}
{/each}
```

No `$` prefixes on stores, no manual subscriptions, no cleanup code. Just reactive data that works.

### 2. Classes Over Stores (When Appropriate)

**Reactive classes for component-local state, stores for global state.**

```typescript
// Component-local: Reactive class
class EventSubscription {
  events = $state<NDKEvent[]>([]);
  eosed = $state(false);
}

// Global shared state: Store
export const profiles = createProfileStore();
export const sessions = createSessionStore();
```

This follows Svelte 5's guidance:
- Use runes for local/component state
- Use stores for state shared across components

### 3. Zero Manual Cleanup

**Subscriptions clean themselves up.**

```svelte
<script lang="ts">
const notes = ndk.$subscribe([{ kinds: [1] }]);
// That's it. No onDestroy, no unsubscribe, nothing.
</script>
```

The subscription automatically stops when the component unmounts. This is achieved through Svelte's lifecycle integration, not magic.

### 4. Performance by Default

**Buffered updates, smart deduplication, lazy loading.**

Events are batched by default (30ms buffer) to prevent unnecessary renders:

```typescript
// 100 events arrive in 50ms
// Without buffering: 100 renders
// With buffering: 2 renders (one batch, then remainder)
```

After EOSE, buffering reduces to 16ms (~60fps) for responsive updates.

### 5. Beautiful APIs

**Code should read like prose.**

```svelte
<script lang="ts">
// Good: Clear, expressive
const highlights = ndk.$subscribe([{ kinds: [9802] }]);
const profile = profiles.get(pubkey);
const isMuted = mutes.check({ pubkey });

// Bad: Verbose, unclear
const highlightsStore = $ndk.storeSubscribe([{ kinds: [9802] }]);
const profile = $profiles.getProfile(pubkey);
const isMuted = $mutes.isItemMuted({ type: 'pubkey', value: pubkey });
</script>
```

Names should be obvious. APIs should be predictable. Complexity should be hidden.

### 6. TypeScript First

**Types that actually help.**

```typescript
// Types are inferred automatically
const highlights = ndk.$subscribe<NDKHighlight>(
  [{ kinds: [9802] }],
  { eventClass: NDKHighlight }
);

// highlights.events is NDKHighlight[] - editor knows this
highlights.events[0].highlightedContent; // Autocomplete works
```

Types are not an afterthought - they're designed for excellent DX.

## Architectural Decisions

### Why Reactive Classes?

**Component-local subscriptions as reactive class instances.**

```typescript
class EventSubscription<T extends NDKEvent> {
  events = $state<T[]>([]);
  eosed = $state(false);
  count = $derived(this.events.length);

  start() { /* ... */ }
  stop() { /* ... */ }
}
```

**Benefits:**
- Natural encapsulation
- Methods and state in one place
- Easy to extend
- Type-safe
- Feels native to Svelte 5

**Why a class over a module of functions?**

We considered a functional approach:
```typescript
// Alternative: Module-based
export function subscribe(filters) {
  const events = $state([]);
  const eosed = $state(false);
  // ... setup logic
  return { events, eosed, stop: () => {} };
}
```

**The class wins because:**
1. **Lifecycle management** - `$effect` inside constructor for auto-cleanup
2. **State encapsulation** - Private event map, buffer state
3. **Method context** - `this` binding for callbacks
4. **Type inference** - Better generic support
5. **Extensibility** - Easy to subclass if needed

**However**, the class is kept minimal. It's not a "God object" - it only handles:
- Event reception
- Deduplication
- Lifecycle
- Reactive state

It does NOT handle:
- Relay management (use NDK directly)
- Publishing (use NDK directly)
- Signing (use NDK directly)

### Why Global Stores?

**For truly shared state, stores are still the right choice.**

```typescript
// profiles.svelte.ts
export const profiles = (() => {
  const cache = $state(new Map<string, NDKUserProfile>());

  return {
    get: (pubkey: string) => cache.get(pubkey),
    set: (pubkey: string, profile: NDKUserProfile) => cache.set(pubkey, profile),
    // ...
  };
})();
```

**Why not just a class?**
```typescript
// This works, but...
class ProfileStore {
  cache = $state(new Map());
}
export const profiles = new ProfileStore();
```

The functional pattern is more flexible for HMR, testing, and avoiding singleton issues.

### Why Buffering?

**Prevents render thrashing.**

When 50 events arrive in 100ms:

```typescript
// Without buffering
event arrives → update state → render (50 times!)

// With buffering (30ms)
events arrive → buffer → flush → render (2-3 times)
```

After EOSE, we reduce to 16ms (60fps) for responsive real-time updates.

**Configurable:**
```typescript
// High-frequency, batched (default)
ndk.$subscribe([filters], { bufferMs: 30 });

// Real-time, immediate
ndk.$subscribe([filters], { bufferMs: false });

// Custom timing
ndk.$subscribe([filters], { bufferMs: 100 });
```

**Edge cases handled:**
- **No EOSE**: Timeout after 5 seconds to switch to 16ms buffer
- **Late EOSE**: Already in 16ms mode, no issue
- **EOSE never sent**: Fallback timeout prevents infinite buffering
- **Per-subscription**: Each subscription manages its own buffer independently

### Why Automatic Filtering?

**Muted and deleted content should be invisible by default.**

```typescript
// Default behavior
const notes = ndk.$subscribe([{ kinds: [1] }]);
// Automatically filters muted users and deleted events

// Opt-out if needed
const notes = ndk.$subscribe([{ kinds: [1] }], {
  skipMuted: false,
  skipDeleted: false
});
```

This follows the principle of **secure by default**. Most apps want this behavior.

### Why Reference Counting?

**Share subscriptions across components efficiently.**

```typescript
// lib/stores/highlights.ts
export const highlightsSubscription = ndk.$subscribe(
  [{ kinds: [9802] }],
  { autoStart: false }
);

// Component A mounts
highlightsSubscription.ref(); // refCount: 0 → 1, starts subscription

// Component B mounts
highlightsSubscription.ref(); // refCount: 1 → 2, reuses subscription

// Component A unmounts
highlightsSubscription.unref(); // refCount: 2 → 1, keeps running

// Component B unmounts
highlightsSubscription.unref(); // refCount: 1 → 0, stops subscription
```

**Benefits:**
- No redundant subscriptions
- Reduced bandwidth
- Synchronized data across components
- Lower relay load

### Why Separate Stores for Profiles/Sessions/Mutes?

**Different lifecycles, different concerns.**

```typescript
// profiles: Cache layer, long-lived
profiles.get(pubkey); // Fetch once, cache forever

// sessions: User authentication, app-lifetime
sessions.current; // Active for entire app session

// mutes: User preferences, persistent
mutes.check({ pubkey }); // Persisted to NIP-51 lists

// subscriptions: View-specific, component-lifetime
const notes = ndk.$subscribe([filters]); // Lives with component
```

Each store has different semantics and lifecycles. Separating them makes each simpler.

## Patterns

### The Subscription Pattern

```typescript
class EventSubscription<T extends NDKEvent> {
  // State
  private eventMap = new Map<string, T>();
  events = $state<T[]>([]);
  eosed = $state(false);

  // Derived
  count = $derived(this.events.length);
  isEmpty = $derived(this.events.length === 0);

  // Effects
  constructor() {
    $effect(() => {
      // Auto-cleanup on component unmount
      return () => this.stop();
    });
  }

  // Methods
  start() { /* ... */ }
  stop() { /* ... */ }
}
```

**Key aspects:**
- Reactive state with `$state`
- Computed values with `$derived`
- Auto-cleanup with `$effect`
- Encapsulated methods
- Type-safe interface

### The Store Pattern

```typescript
// Global store using Svelte 5 $state
export const profiles = (() => {
  const cache = $state(new Map<string, NDKUserProfile>());
  const pending = $state(new Set<string>());

  return {
    get(pubkey: string) {
      if (!cache.has(pubkey) && !pending.has(pubkey)) {
        this.fetch(pubkey);
      }
      return cache.get(pubkey);
    },

    async fetch(pubkey: string) {
      pending.add(pubkey);
      const profile = await fetchProfile(pubkey);
      cache.set(pubkey, profile);
      pending.delete(pubkey);
    },

    // Expose reactive state
    get all() {
      return cache;
    }
  };
})();
```

**Key aspects:**
- Immediately invoked function returns API
- Internal state is private
- Lazy loading
- Reactive getters
- Clear, focused interface

### The Reactive Event Pattern

```typescript
class ReactiveEvent extends NDKEvent {
  deleted = $state(false);
  reactions = $state(new Map<string, number>());
  zaps = $state(0);

  constructor(ndk: NDK, event: NostrEvent) {
    super(ndk, event);

    // Listen for related events
    $effect(() => {
      const sub = ndk.$subscribe([
        { kinds: [5], '#e': [this.id] }, // Deletions
        { kinds: [7], '#e': [this.id] }, // Reactions
        { kinds: [9735], '#e': [this.id] } // Zaps
      ]);

      return () => sub.stop();
    });
  }
}
```

**Key aspects:**
- Events become reactive objects
- Automatically track related events
- Clean up properly
- Type-safe extensions

## Anti-Patterns

### ❌ Manual Subscriptions in Components

```svelte
<!-- Bad -->
<script lang="ts">
let events = $state<NDKEvent[]>([]);

const sub = ndk.$subscribe([filters]);
sub.on('event', (e) => events.push(e));

onDestroy(() => sub.stop());
</script>
```

**Why bad:**
- Manual event handling
- Manual cleanup
- Easy to forget unsubscribe
- Not reactive by default

**Better:**
```svelte
<script lang="ts">
const subscription = ndk.$subscribe([filters]);
</script>

{#each subscription.events as event}
  <!-- ... -->
{/each}
```

### ❌ Wrapper Types

```typescript
// Bad: Unnecessary wrapper
interface SubscriptionResult<T> {
  events: T[];
  eosed: boolean;
  unsubscribe: () => void;
}

// Good: Direct class instance
class EventSubscription<T> {
  events = $state<T[]>([]);
  eosed = $state(false);
  stop() { /* ... */ }
}
```

### ❌ Global Mutable State

```typescript
// Bad
export let currentUser: NDKUser | undefined;

export function setCurrentUser(user: NDKUser) {
  currentUser = user;
}
```

**Why bad:**
- Not reactive
- Hard to track changes
- Testing nightmare

**Better:**
```typescript
export const sessions = createSessionStore();

// Usage
sessions.current; // Reactive
sessions.login(signer); // Clear API
```

### ❌ Callback Hell

```typescript
// Bad
ndk.$subscribe([filters], {
  onEvent: (event) => {
    if (!event.hasTag('deleted')) {
      if (!isMuted(event.pubkey)) {
        events.push(event);
      }
    }
  }
});
```

**Better:**
```typescript
// Filtering is built-in
const subscription = ndk.$subscribe([filters], {
  skipDeleted: true,
  skipMuted: true
});

// Just use the events
subscription.events;
```

### ❌ EOSE-Based Loading States

```svelte
<!-- Bad: Blocks UI on EOSE -->
<script>
const notes = ndk.$subscribe([{ kinds: [1] }]);
</script>

{#if !notes.eosed}
  <div>Loading...</div>
{:else}
  {#each notes.events as note}
    <Note {note} />
  {/each}
{/if}
```

**Why this is terrible:**
- Events are **streaming** - they arrive continuously
- EOSE is an implementation detail, not a user-facing concept
- Creates artificial "loading" states in an event-based system
- Blocks content from showing immediately
- Horrible UX - users wait unnecessarily

**Better approach - progressive rendering:**
```svelte
<script>
const notes = ndk.$subscribe([{ kinds: [1] }]);
</script>

<!-- Just show events as they arrive -->
{#each notes.events as note}
  <Note {note} />
{/each}

<!-- Show empty state if actually empty -->
{#if notes.isEmpty}
  <EmptyState />
{/if}
```

**Even better - optimistic UI:**
```svelte
<script>
// Show cached/optimistic content immediately
const notes = ndk.$subscribe([{ kinds: [1] }], {
  cache: true // Show cached events instantly
});
</script>

{#each notes.events as note}
  <Note {note} />
{/each}
```

**The EOSE flag exists for:**
- Triggering pagination
- Analytics/debugging
- Relay performance monitoring
- Optimizing buffer behavior (switching to 16ms after EOSE)

**NOT for:**
- User-facing loading states
- Blocking UI
- Hiding content

## Future Considerations

### Component Library

Pre-built components for common patterns:

```svelte
<EventFeed {filters} />
<UserProfile {pubkey} />
<RelayStatus {relayUrl} />
<WalletBalance />
```

### Advanced Caching

```typescript
// Persistent cache across sessions
const notes = ndk.$subscribe([filters], {
  cache: {
    adapter: IndexedDBAdapter,
    ttl: 3600
  }
});
```

### Optimistic Updates

```typescript
const note = await ndk.publish(event, {
  optimistic: true // Add to subscriptions immediately
});
```

### Virtual Scrolling

Built-in virtual list support for large feeds:

```svelte
<VirtualList items={subscription.events} let:item>
  <EventCard event={item} />
</VirtualList>
```

## Inspiration

- **Svelte 5 Runes**: Learn from the best reactive system
- **TanStack Query**: Excellent async state management
- **Zustand**: Simple, effective stores
- **ndk-hooks**: React patterns adapted for Svelte
- **Relay Clients**: WebSocket management patterns

## Goals

- ✅ Beautiful, ergonomic APIs
- ✅ Type-safe by default
- ✅ Performant out of the box
- ✅ Zero boilerplate
- ✅ Extensible architecture
- ✅ Excellent documentation
- ✅ Real-world tested

## Non-Goals

- ❌ Backwards compatibility with ndk-svelte
- ❌ Supporting Svelte 4
- ❌ Wrapping every NDK feature (use NDK directly when appropriate)
- ❌ Being framework-agnostic (we're Svelte-first)

---

**Let's build the best Nostr library for Svelte 5. 🚀**
