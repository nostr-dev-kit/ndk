# subscribeReactive Reactivity Fix

## Problem

The `subscribeReactive` method was not properly triggering reactivity in Svelte 5 components. Events would arrive, but the UI wouldn't update automatically.

## Root Cause

The `EventSubscription` class had `$state` variables declared as **private** with **public getters**:

```typescript
// ❌ OLD - Broken reactivity
class EventSubscription<T extends NDKEvent> {
  private _events = $state<T[]>([]);
  private _eosed = $state(false);

  get events(): T[] {
    return this._events;
  }

  get eosed(): boolean {
    return this._eosed;
  }
}
```

**Why this didn't work:**
- Svelte 5's fine-grained reactivity tracks `$state` variables directly
- Accessing a `$state` variable through a getter doesn't create a reactive dependency
- The reactivity was lost at the getter boundary

## Solution

Two critical changes were needed:

### 1. Make `$state` properties **public**

Svelte can only track `$state` directly, not through getters:

```typescript
// ✅ NEW - Working reactivity
class EventSubscription<T extends NDKEvent> {
  events = $state<T[]>([]);
  eosed = $state(false);
  error = $state<Error | undefined>(undefined);
  status = $state<ConnectionStatus>('connecting');
  refCount = $state(0);

  // Derived getters still work fine
  get count(): number {
    return this.events.length;
  }

  get isEmpty(): boolean {
    return this.events.length === 0;
  }
}
```

### 2. Mutate arrays in place, don't replace them

When updating the events array, we must **mutate it in place** rather than replacing the reference:

```typescript
// ❌ OLD - Doesn't trigger reactivity
private updateEventsArray() {
  const newEvents = [...]; // sorted events
  this.events = newEvents; // Replaces reference - might not trigger reactivity
}

// ✅ NEW - Triggers reactivity
private updateEventsArray() {
  const newEvents = [...]; // sorted events
  this.events.length = 0;  // Clear the array
  this.events.push(...newEvents); // Mutate in place
}
```

This is crucial because Svelte 5's reactivity tracks **mutations to the array**, not replacements of the entire array reference when the class is instantiated outside a component's reactive context.

## How It Works Now

When you access subscription properties in reactive contexts, Svelte tracks the `$state` directly:

```svelte
<script lang="ts">
const sub = ndk.subscribeReactive([{ kinds: [1], limit: 20 }]);

// ✅ Reactive - tracked in template
</script>

{#each sub.events as event}
  <div>{event.content}</div>
{/each}

{#if sub.eosed}
  <p>Loaded {sub.count} events</p>
{/if}

<!-- ✅ Reactive - tracked in $effect -->
<script lang="ts">
$effect(() => {
  console.log('Events updated:', sub.events.length);
});
</script>
```

## Important: Reactive Contexts

`$state` variables **only track changes when accessed in reactive contexts**:

### ✅ Reactive Contexts (these work):
- Svelte templates (`{sub.events}`, `{#each sub.events}`)
- `$effect` blocks
- `$derived` expressions

### ❌ Non-Reactive Contexts (these DON'T work):
- Regular JavaScript functions
- Event handlers (without wrapping in $effect)
- Console.log in top-level script

```svelte
<script lang="ts">
const sub = ndk.subscribeReactive([{ kinds: [1] }]);

// ❌ Won't track changes
function logCount() {
  console.log(sub.events.length);
}

// ✅ Will track changes
$effect(() => {
  console.log('Reactive count:', sub.events.length);
});
</script>
```

## Changes Made

1. **EventSubscription class** (`src/lib/subscription.svelte.ts`)
   - Changed `private _events`, `_eosed`, etc. to public `events`, `eosed`
   - Removed getter indirection for reactive properties
   - Updated all internal references to use public properties directly

2. **Documentation** (`README.md`)
   - Added troubleshooting section explaining reactivity
   - Updated API documentation to reflect public `$state` properties
   - Added examples of reactive vs non-reactive access

3. **Build verified** - Package builds successfully with all changes

## Testing

To verify the fix works:

```svelte
<script lang="ts">
import { NDKSvelte } from '@nostr-dev-kit/svelte';

const ndk = new NDKSvelte({
  explicitRelayUrls: ['wss://relay.damus.io']
});

const sub = ndk.subscribeReactive([{ kinds: [1], limit: 20 }]);

// This should log whenever events arrive
$effect(() => {
  console.log('Events:', sub.events.length);
});
</script>

<h1>Events: {sub.events.length}</h1>
<p>EOSE: {sub.eosed ? 'Yes' : 'No'}</p>

{#each sub.events as event}
  <div>{event.content}</div>
{/each}
```

## Key Takeaways

1. **Direct `$state` access is crucial** - Svelte 5 needs direct access to `$state` variables to track them
2. **Public properties are fine** - There's no harm in making reactive state public in a reactive system
3. **Mutate arrays in place** - When updating `$state` arrays, mutate them (`.length = 0`, `.push()`) rather than replacing the reference
4. **Reactive contexts matter** - Always access reactive state in templates, `$effect`, or `$derived`
5. **This is the ergonomic solution** - No hacks, no workarounds, just clean reactive code following Svelte 5 best practices
