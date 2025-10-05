# NDK-Svelte5 Architecture Analysis & Usage Guide

## Architecture Assessment

The architecture of ndk-svelte5 is **fundamentally correct** but has critical documentation issues. Here's the actual pattern:

### ✅ **Correct Architectural Decisions**

1. **Namespace Pattern** - All stores live under the NDK instance:
   ```typescript
   const ndk = createNDK();
   // Access stores through ndk instance
   ndk.sessions.current
   ndk.wallet.balance
   ndk.wot.getScore(pubkey)
   ```
   This provides excellent discoverability and avoids global state pollution.

2. **Factory Pattern with Smart Defaults**:
   ```typescript
   export function createNDK(options: CreateNDKOptions = {}): NDKSvelte {
     // Smart defaults: auto-connect, default relays, auto-cache setup
   }
   ```

3. **Class-based Reactive Stores Using Svelte 5 Runes**:
   ```typescript
   export class ReactiveSessionsStore {
     sessions = $state<Map<Hexpubkey, NDKSession>>(new Map());
     activePubkey = $state<Hexpubkey | undefined>(undefined);

     // Computed getters (could use $derived but works as-is)
     get current(): NDKSession | undefined {
       if (!this.activePubkey) return undefined;
       return this.sessions.get(this.activePubkey);
     }
   }
   ```

4. **Subscription Override Pattern**:
   ```typescript
   // NDKSvelte overrides subscribe() to return reactive Subscription
   subscribe<T extends NDKEvent = NDKEvent>(
     filters: NDKFilter | NDKFilter[],
     opts?: SubscribeOptions
   ): Subscription<T> {
     return createReactiveSubscription<T>(this, filters, opts);
   }
   ```

## How Apps Should ACTUALLY Use It

### 1. **Basic Setup** (The Real Way)

```typescript
// lib/ndk.ts
import { createNDK } from '@nostr-dev-kit/ndk-svelte5';

export const ndk = createNDK({
  explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol'],
  autoConnect: true,  // default
  cache: true,        // default - auto-configures SQLite WASM
});
```

### 2. **Reactive Event Subscriptions**

The subscription system is elegant and works perfectly with Svelte 5:

```svelte
<script lang="ts">
  import { ndk } from '$lib/ndk';

  // Static filters - auto-starts
  const notes = ndk.subscribe([
    { kinds: [1], limit: 100 }
  ]);

  // Access reactive properties in templates
  // These are reactive getters that trigger updates
</script>

{#if notes.eosed}
  <p>Loaded {notes.count} notes</p>
{/if}

{#each notes.events as note}
  <div>{note.content}</div>
{/each}

<!-- Latest note -->
{#if notes.latest}
  <div>Latest: {notes.latest.content}</div>
{/if}
```

### 3. **Reactive Filters** (Advanced)

For filters that change based on state:

```svelte
<script lang="ts">
  import { createSubscription } from '@nostr-dev-kit/ndk-svelte5';

  let kind = $state(1);

  // Pass a function for reactive filters
  // Subscription auto-restarts when filters change
  const events = createSubscription(ndk, () => ({
    kinds: [kind],
    limit: 50
  }));

  // Change kind triggers re-subscription
  function switchToArticles() {
    kind = 30023;
  }
</script>
```

### 4. **Session Management**

```svelte
<script lang="ts">
  import { ndk } from '$lib/ndk';
  import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

  // Access sessions through ndk instance
  const sessions = ndk.sessions;

  async function login() {
    const signer = new NDKPrivateKeySigner(nsec);
    await sessions.login(signer, {
      profile: true,
      follows: true
    });
  }
</script>

<!-- Reactive session state -->
{#if sessions.current}
  <p>Logged in as: {sessions.profile?.name}</p>
  <p>Following: {sessions.follows.size} users</p>
{:else}
  <button onclick={login}>Login</button>
{/if}
```

### 5. **WoT Integration**

```svelte
<script lang="ts">
  import { ndk } from '$lib/ndk';

  // Subscribe with WoT filtering
  const trustedNotes = ndk.subscribe(
    [{ kinds: [1], limit: 100 }],
    {
      wot: {
        maxDepth: 2,
        minScore: 0.5,
        includeUnknown: false
      }
    }
  );

  // Or use WoT directly
  const wotScore = ndk.wot.getScore(pubkey);
  const inNetwork = ndk.wot.includes(pubkey);
</script>
```

### 6. **Wallet & Payments**

```svelte
<script lang="ts">
  import { ndk } from '$lib/ndk';
  import { NDKCashuWallet } from '@nostr-dev-kit/ndk-wallet';

  // Set wallet
  const wallet = new NDKCashuWallet(ndk);
  ndk.wallet.set(wallet);

  // Reactive balance
  $: balance = ndk.wallet.balance;

  // Check zap status
  const isZapped = ndk.payments.isZapped(event);
  const zapAmount = ndk.payments.getZapAmount(event);
</script>

<p>Balance: {balance} sats</p>
```

## Architecture Problems & Solutions

### ❌ **Problem 1: Examples Use Wrong API**
The sessions-demo uses `initStores()` and imports `sessions` directly - these don't exist!

**Solution**: Update all examples to use `createNDK()` pattern.

### ❌ **Problem 2: Missing Reactivity for Computed Values**
Some stores use regular getters instead of `$derived`:

```typescript
// Current (works but not optimal)
get current(): NDKSession | undefined {
  if (!this.activePubkey) return undefined;
  return this.sessions.get(this.activePubkey);
}

// Better (truly reactive)
current = $derived.by(() => {
  if (!this.activePubkey) return undefined;
  return this.sessions.get(this.activePubkey);
});
```

### ❌ **Problem 3: Type Exports**
The package doesn't export the `NDKSvelte` type directly, making typing difficult:

```typescript
// Can't do this currently:
import type { NDKSvelte } from '@nostr-dev-kit/ndk-svelte5';

// Have to use:
import { createNDK } from '@nostr-dev-kit/ndk-svelte5';
type NDKSvelteType = ReturnType<typeof createNDK>;
```

## Best Practices for Apps

### 1. **Single NDK Instance**
Create one NDK instance and share it across your app:
```typescript
// lib/ndk.ts
export const ndk = createNDK({ /* config */ });

// Use in any component
import { ndk } from '$lib/ndk';
```

### 2. **Leverage Reactive Properties**
The subscription object properties (`events`, `count`, `eosed`, `latest`) are reactive getters - use them directly in templates.

### 3. **Cleanup Not Required**
Subscriptions auto-cleanup when components unmount (Svelte 5 handles this).

### 4. **Use Derived for Computed State**
```svelte
<script>
  const notes = ndk.subscribe([{ kinds: [1] }]);

  // Derive computed values
  const notesByAuthor = $derived.by(() => {
    const map = new Map();
    for (const note of notes.events) {
      if (!map.has(note.pubkey)) map.set(note.pubkey, []);
      map.get(note.pubkey).push(note);
    }
    return map;
  });
</script>
```

### 5. **Reactive Filters Pattern**
For dynamic subscriptions, use the function form:
```typescript
const sub = createSubscription(ndk, () => {
  // This re-runs when dependencies change
  return { kinds: [selectedKind], authors: [selectedAuthor] };
});
```

## Conclusion

The architecture is **sound and well-designed** with proper Svelte 5 patterns. The main issues are:
1. **Documentation shows wrong API** (critical)
2. **Examples use non-existent functions**
3. **Some missed opportunities for `$derived`**

Once documentation is fixed to show the actual `createNDK()` → `ndk.stores` pattern, this is an excellent architecture for Svelte 5 Nostr apps.