# ndk-svelte5 Architecture Analysis & Future Vision

## Current Architecture Assessment

### 1. **Design Pattern: Hybrid Reactive Store + Runes Architecture**

The current ndk-svelte5 uses a **mixed pattern** combining:

**A. Global Singleton Stores** (`$state` classes):
- `profiles` - Profile caching store
- `sessions` - Multi-session management
- `mutes` - Mute management
- `wallet` - Wallet state
- `wot` - Web of Trust
- `payments` - Payment tracking
- `pool` - Pool state

**B. Factory Functions** (returning reactive instances):
- `createNDK()` - NDK initialization helper
- `createSubscription()` - Reactive subscription factory
- `useUser()` - User resolution helper
- `useBlossomUpload()` - Blossom upload instance
- `useZapAmount()`, `useIsZapped()`, etc. - Payment runes

**C. Class Instances** (stateful reactive objects):
- `BlossomUpload` - File upload state machine
- `BlossomUrl` - URL resolution state machine

### 2. **Strengths**

✅ **Excellent Svelte 5 Integration**
- Proper use of `$state`, `$derived`, `$effect.root()`
- Fine-grained reactivity where it matters
- Minimal re-rendering

✅ **Smart Auto-Management**
- Automatic profile fetching on access (`profiles.get(pubkey)`)
- Automatic WoT filtering in subscriptions
- Session persistence out of the box
- Pending → Confirmed transaction matching

✅ **Clean Separation of Concerns**
- Global state (profiles, sessions) in stores
- Subscription state in `createSubscription()`
- Component-specific state in `use*()` runes

✅ **Developer Experience Features**
- Auto-connect on `createNDK()`
- Auto-cleanup of subscriptions
- TypeScript inference works well
- Sensible defaults everywhere

✅ **Advanced Capabilities**
- Multi-session support with persistence
- WoT filtering with auto-reload
- Payment tracking with smart matching
- Cashu wallet integration with proof management

### 3. **Weaknesses & Inconsistencies**

❌ **Inconsistent API Surface**

1. **Mixed Return Types**:
   - `createSubscription()` returns object with getters: `{ get events(), get latest() }`
   - `useWoTScore()` returns object with getter: `{ get value() }`
   - `useZapAmount()` returns **function**: `() => number`
   - `useUser()` returns object with getters: `{ get pubkey(), get profile() }`

2. **Initialization Confusion**:
   ```ts
   // Option 1: Helper function
   const ndk = createNDK({ ... });

   // Option 2: Manual
   const ndk = new NDK({ ... });
   await initStores(ndk);
   ```

3. **Mixed Access Patterns**:
   ```ts
   // Some use direct access
   profiles.get(pubkey)
   sessions.current
   wallet.balance

   // Some use getters
   subscription.events  // getter
   subscription.latest  // getter

   // Some return functions
   const getAmount = useZapAmount(event)
   getAmount()  // Why double call?
   ```

❌ **Store vs Rune Blur**

- `payments` is a global singleton but exported from `/stores`
- `useZapAmount()` accesses `payments` store internally
- No clear line: "When to use store directly vs use a rune?"

❌ **Naming Inconsistencies**

- `createSubscription()` vs `useUser()` vs `useBlossomUpload()`
- All are factory functions, why different prefixes?
- `sessions` (store) vs `Session` (interface) - confusing

❌ **Type Complexity**

- `Subscription<T>` interface separate from implementation
- `SubscribeOptions` has 10+ properties
- Payment types split across multiple files

### 4. **Initialization Flow Analysis**

Current flow is **somewhat convoluted**:

```ts
// createNDK does:
1. Create NDK instance
2. Auto-setup SQLite cache (async, fire-and-forget!)
3. Call initStores()
4. Auto-connect

// initStores does:
1. profiles.init(ndk)
2. await sessions.init(ndk, storage?)
3. mutes.init(ndk)
4. wallet.init(ndk)
5. pool.init(ndk)
6. wot.init(ndk)
7. Maybe load WoT if config + session
```

**Problems**:
- Cache init is async but not awaited (race condition potential)
- `initStores()` can be called before `createNDK()` or after `new NDK()`
- Some stores need session, some don't - unclear dependencies
- WoT auto-reload via callback, not declarative

---

## Alternative Approaches: The Svelte 5 Way

### **Approach 1: Pure Runes (TanStack Query Style)**

**Philosophy**: Everything is a rune. No global state except NDK itself.

```ts
// Single creation point
const ndk = createNDK({ relays: [...] });

// Subscriptions as runes
const notes = useSubscription(ndk, () => ({
  kinds: [1],
  authors: [author()]  // Reactive!
}));

// Profiles as runes
const profile = useProfile(ndk, pubkey);

// Sessions as runes
const session = useSession(ndk, { persist: true });

// WoT as runes
const inWoT = useInWoT(ndk, pubkey);
const wotScore = useWoTScore(ndk, pubkey);

// Wallet as runes
const wallet = useWallet(ndk);
const balance = useWalletBalance(wallet);
```

**Pros**:
- ✅ Consistent `use*()` prefix for ALL data fetching
- ✅ Explicit dependencies (pass `ndk` to every rune)
- ✅ Fully reactive filters with `() => {...}`
- ✅ No hidden global state
- ✅ Easy to understand: "Everything is a rune"

**Cons**:
- ❌ Passing `ndk` everywhere is verbose
- ❌ Profile cache would be per-component (wasteful)
- ❌ Session state should be global (multi-tab sync)
- ❌ Re-creating subscriptions on every mount

---

### **Approach 2: Context + Runes (SvelteKit Style)**

**Philosophy**: Use Svelte context for NDK, runes for reactive state.

```ts
// Root layout
import { setNDKContext } from '$lib/ndk';

const ndk = createNDK({ relays: [...] });
setNDKContext(ndk);

// Any component
const ndk = getNDKContext();
const notes = useSubscription(() => ({
  kinds: [1],
  authors: [author()]
}));

// Profiles automatically cached in context
const profile = useProfile(pubkey);

// Session from context
const session = useSession();
```

**Pros**:
- ✅ No prop drilling
- ✅ Clean component code
- ✅ Can share caches (profiles, etc.) via context
- ✅ Testable (mock context)

**Cons**:
- ❌ Context is component-tree dependent
- ❌ Can't use outside components (in `.ts` files)
- ❌ SSR complexity (different context per request)

---

### **Approach 3: Reactive Class Singleton (Current, but Improved)**

**Philosophy**: NDK is a reactive singleton. Stores are namespaced under NDK.

```ts
// Single export
export const ndk = createNDK({
  relays: [...]
});

// Everything accessed through ndk
const notes = ndk.subscribe(() => ({ kinds: [1] }));
const profile = ndk.profiles.get(pubkey);
const session = ndk.sessions.current;
const wallet = ndk.wallet;
const wot = ndk.wot;

// Or use convenience runes
const profile = useProfile(pubkey);  // Uses global ndk internally
const inWoT = useInWoT(pubkey);
```

**Pros**:
- ✅ Single import: `import { ndk } from '$lib/ndk'`
- ✅ Clear namespace: `ndk.profiles`, `ndk.sessions`, etc.
- ✅ Global cache is natural (profiles, WoT)
- ✅ Can use in `.ts` files
- ✅ Runes are sugar over singleton

**Cons**:
- ❌ Global state (harder to test)
- ❌ Can't have multiple NDK instances easily
- ❌ Import order matters

---

### **Approach 4: Dependency Injection + Runes (Angular/NestJS Style)**

**Philosophy**: Explicit DI, everything is a service.

```ts
// Create services
const profileService = createProfileService(ndk);
const sessionService = createSessionService(ndk);
const walletService = createWalletService(ndk);

// Use in components
const profile = profileService.get(pubkey);
const session = sessionService.current;

// Or with runes
const profile = useProfile(profileService, pubkey);
```

**Pros**:
- ✅ Explicit dependencies
- ✅ Highly testable (mock services)
- ✅ Clear service boundaries
- ✅ Can compose services

**Cons**:
- ❌ Too much boilerplate
- ❌ Not Svelte-idiomatic
- ❌ Overkill for most apps

---

## Recommended Approach: "Namespaced Reactive Singleton + Runes"

### Core Philosophy

1. **NDK is the root reactive singleton** - Created once, accessed globally
2. **Stores are namespaced under NDK** - `ndk.profiles`, `ndk.sessions`, etc.
3. **Runes are convenience wrappers** - `useProfile(pubkey)` → `ndk.profiles.get(pubkey)`
4. **Reactive by default** - All subscriptions/queries return reactive state
5. **Consistent API surface** - Same pattern everywhere

### API Design

```ts
// ============================================
// 1. INITIALIZATION (Single Function)
// ============================================

import { createNDK } from '@nostr-dev-kit/ndk-svelte5';

export const ndk = createNDK({
  // NDK options
  relays: ['wss://relay.damus.io'],

  // Auto-features (all optional)
  cache: true,               // SQLite WASM cache
  autoConnect: true,         // Connect on create

  // Store configs
  sessions: {
    persist: true,           // localStorage persistence
    storage: customStorage,  // or custom adapter
  },

  wot: {
    autoLoad: true,          // Load on session change
    autoFilter: {            // Auto-filter subscriptions
      maxDepth: 2,
      minScore: 0.5,
    },
  },
});

// That's it! Everything is initialized.

// ============================================
// 2. SUBSCRIPTIONS (Consistent API)
// ============================================

// Returns: { events: T[], latest: T, eosed: boolean, ... }
const notes = ndk.subscribe(() => ({
  kinds: [1],
  authors: [author()],  // Reactive!
  limit: 50
}));

// Usage in template
{#each notes.events as note}
  <div>{note.content}</div>
{/each}

// ============================================
// 3. PROFILES (Namespaced Store)
// ============================================

// Direct access
const profile = ndk.profiles.get(pubkey);

// Batch fetch
await ndk.profiles.fetch([pk1, pk2, pk3]);

// Update
await ndk.profiles.update({ name: 'Alice' });

// Or use rune (same result)
const profile = useProfile(pubkey);

// ============================================
// 4. SESSIONS (Namespaced Store)
// ============================================

// Current session
const current = ndk.sessions.current;

// Login
await ndk.sessions.login(signer);

// Multi-session
await ndk.sessions.add(signer2);
ndk.sessions.switch(pubkey);

// Reactive accessors
const follows = ndk.sessions.follows;
const mutes = ndk.sessions.mutes;

// Or use rune
const session = useSession();

// ============================================
// 5. WEB OF TRUST (Namespaced Store)
// ============================================

// Direct access
const score = ndk.wot.getScore(pubkey);
const distance = ndk.wot.getDistance(pubkey);
const inWoT = ndk.wot.includes(pubkey);

// Load/config
await ndk.wot.load({ depth: 2 });
ndk.wot.enableAutoFilter({ maxDepth: 2 });

// Or use runes
const score = useWoTScore(pubkey);
const distance = useWoTDistance(pubkey);
const inWoT = useInWoT(pubkey);

// All return: { value: T } for consistency

// ============================================
// 6. WALLET (Namespaced Store)
// ============================================

// Direct access
const balance = ndk.wallet.balance;
const history = ndk.wallet.history;
const mints = ndk.wallet.mints;

// Initialize
await ndk.wallet.init(user, { mints: [...] });

// Operations
await ndk.wallet.pay({ amount: 1000 });
const deposit = ndk.wallet.deposit(1000, mint);
await ndk.wallet.receiveToken(token);

// Or use runes
const balance = useWalletBalance();
const history = useWalletHistory();

// ============================================
// 7. PAYMENTS (Namespaced Store)
// ============================================

// Direct access
const amount = ndk.payments.getZapAmount(event);
const isZapped = ndk.payments.isZapped(event);
const pending = ndk.payments.pending;
const history = ndk.payments.history;

// Zap with auto-tracking
await ndk.payments.zap(event, 1000, { comment: 'Nice!' });

// Or use runes
const amount = useZapAmount(event);
const isZapped = useIsZapped(event);
const pending = usePendingPayments();

// All return: { value: T } for consistency

// ============================================
// 8. USER RESOLUTION (Helper Rune)
// ============================================

const user = useUser(identifier);  // npub, nip-05, hex

// Returns: { pubkey, npub, profile }
{user.profile?.name}

// ============================================
// 9. BLOSSOM (Stateful Class Instances)
// ============================================

const upload = useBlossomUpload(blossom);

await upload.upload(file);

// Reactive state
upload.status   // 'idle' | 'uploading' | 'success' | 'error'
upload.progress // { loaded, total, percentage }
upload.result   // NDKImetaTag | null
```

### Consistency Rules

#### **Rule 1: All data access returns reactive objects**

```ts
// ✅ Consistent
ndk.subscribe(...)       → { events, latest, eosed, ... }
ndk.profiles.get(...)    → NDKUserProfile | undefined (reactive)
ndk.sessions.current     → Session | undefined (reactive)
ndk.wot.getScore(...)    → number (reactive)

// ❌ Inconsistent (current)
useZapAmount(...)        → () => number  // Why function?
```

#### **Rule 2: Runes return { value } for derived state**

```ts
// ✅ Consistent
const score = useWoTScore(pubkey);      // { value: number }
const distance = useWoTDistance(pubkey); // { value: number | null }
const amount = useZapAmount(event);     // { value: number }

// Access
{score.value}
```

#### **Rule 3: Runes return { ...fields } for object state**

```ts
// ✅ Consistent
const user = useUser(identifier);       // { pubkey, npub, profile }
const session = useSession();           // { current, follows, mutes, ... }

// Access
{user.pubkey}
{session.current?.pubkey}
```

#### **Rule 4: Stateful instances have direct property access**

```ts
// ✅ Consistent
const upload = useBlossomUpload(blossom);
upload.status    // Direct access
upload.progress
upload.result
```

### File Organization

```
ndk-svelte5/src/lib/
├── index.ts                         # Main exports
├── ndk.svelte.ts                    # createNDK() + NDK enhancements
│
├── stores/                          # Namespaced stores (internal)
│   ├── profiles.svelte.ts
│   ├── sessions.svelte.ts
│   ├── wot.svelte.ts
│   ├── wallet.svelte.ts
│   ├── payments.svelte.ts
│   └── mutes.svelte.ts
│
├── runes/                           # Public runes API
│   ├── subscription.svelte.ts       # useSubscription()
│   ├── profile.svelte.ts            # useProfile()
│   ├── session.svelte.ts            # useSession()
│   ├── user.svelte.ts               # useUser()
│   ├── wot.svelte.ts                # useWoTScore(), etc.
│   ├── wallet.svelte.ts             # useWalletBalance(), etc.
│   ├── payments.svelte.ts           # useZapAmount(), etc.
│   └── blossom.svelte.ts            # useBlossomUpload(), etc.
│
└── components/                      # UI components
    ├── Avatar.svelte
    ├── BlossomImage.svelte
    ├── ContentRenderer.svelte
    ├── TransactionList.svelte
    └── ZapButton.svelte
```

### Migration Path

**Phase 1: Normalize Return Types**
- Change `useZapAmount()` from `() => number` to `{ value: number }`
- Change `useIsZapped()` from `() => boolean` to `{ value: boolean }`
- Unify all `use*` runes to return objects

**Phase 2: Namespace Stores Under NDK**
- Move from `import { profiles } from 'stores'`
- To: `ndk.profiles` access
- Keep runes as convenience: `useProfile()` → `ndk.profiles.get()` internally

**Phase 3: Simplify Initialization**
- Make `createNDK()` the only way
- Remove `initStores()` (happens automatically)
- Make all options declarative (no side-effect callbacks)

**Phase 4: Document Patterns**
- "When to use direct access vs runes?"
  - Direct: When you already have `ndk` imported
  - Runes: Convenience in components, cleaner syntax

---

## Ultra-Idiomatic Svelte 5 Patterns

### Pattern 1: Reactive Filters (Already Good!)

```ts
// ✅ Current implementation is excellent
const notes = ndk.subscribe(() => ({
  kinds: [kind()],      // Reactive!
  authors: selectedAuthor() ? [selectedAuthor()] : undefined
}));
```

### Pattern 2: Derived Subscriptions

```ts
// Compose subscriptions with $derived
const notes = ndk.subscribe(() => ({ kinds: [1], limit: 50 }));

const byDay = $derived.by(() => {
  return notes.events.reduce((acc, note) => {
    const day = new Date(note.created_at! * 1000).toDateString();
    (acc[day] ??= []).push(note);
    return acc;
  }, {} as Record<string, NDKEvent[]>);
});
```

### Pattern 3: Reactive User Resolution with Auto-Profile

```ts
// ✅ Current is good, but could be cleaner
const user = useUser(npub);

// Automatically fetches profile on access
{user.profile?.name}

// Could add more derivations
const displayName = $derived(user.profile?.name || user.npub.slice(0, 8));
```

### Pattern 4: Optimistic Updates with Rollback

```ts
// Add to payment runes
async function zapWithRollback(event: NDKEvent, amount: number) {
  const rollbackId = ndk.payments.addOptimistic(event, amount);

  try {
    await ndk.payments.zap(event, amount);
  } catch (err) {
    ndk.payments.rollback(rollbackId);
    throw err;
  }
}
```

### Pattern 5: Subscription Deduplication at Library Level

```ts
// Automatically share subscriptions with same filters
const notes1 = ndk.subscribe({ kinds: [1], limit: 50 });
const notes2 = ndk.subscribe({ kinds: [1], limit: 50 });

// Internally: Same subscription, same events, ref-counted
```

---

## DX Improvements

### 1. **Single Import**

```ts
// Everything from one place
import {
  ndk,              // Singleton
  useProfile,       // Runes
  useSession,
  useWoTScore,
  useSubscription,
  Avatar,           // Components
  TransactionList,
} from '@nostr-dev-kit/ndk-svelte5';
```

### 2. **TypeScript Autocomplete**

```ts
// All namespaced under ndk
ndk.profiles.     // IDE shows: get, fetch, update
ndk.sessions.     // IDE shows: current, login, logout, switch
ndk.wot.          // IDE shows: getScore, getDistance, includes, load
ndk.wallet.       // IDE shows: balance, pay, deposit, mints
ndk.payments.     // IDE shows: zap, pending, history
```

### 3. **Zero Config Defaults**

```ts
// Works out of the box
export const ndk = createNDK();

// Uses default relays
// Auto-connects
// Auto-caches
// Auto-persists sessions
```

### 4. **Progressive Enhancement**

```ts
// Start simple
const ndk = createNDK();

// Add as needed
const ndk = createNDK({
  sessions: { persist: true },
  wot: { autoLoad: true, autoFilter: { maxDepth: 2 } },
  cache: { dbName: 'my-app-cache' },
});
```

---

## Comparison: Current vs Proposed

| Aspect | Current | Proposed |
|--------|---------|----------|
| **Initialization** | `createNDK()` or `new NDK() + initStores()` | `createNDK()` only |
| **Store Access** | Import each: `import { profiles } from 'stores'` | Namespaced: `ndk.profiles` |
| **Rune Return** | Mixed: `() => T` vs `{ get value() }` vs `{ get pubkey() }` | Unified: `{ value: T }` or `{ ...fields }` |
| **Consistency** | 6/10 - Some inconsistencies | 10/10 - Fully consistent |
| **Discoverability** | 7/10 - Must know what to import | 10/10 - Autocomplete shows all |
| **Testability** | 6/10 - Mock multiple stores | 8/10 - Mock `ndk` singleton |
| **Complexity** | Medium - Multiple patterns | Low - One clear pattern |

---

## Summary

### Current State: **7.5/10**
- ✅ Great Svelte 5 integration
- ✅ Powerful features
- ✅ Good DX in many areas
- ❌ Inconsistent API surface
- ❌ Mixed patterns (stores vs runes vs getters)
- ❌ Confusing initialization

### Proposed State: **9.5/10**
- ✅ **Single source of truth**: `ndk` singleton
- ✅ **Namespaced stores**: `ndk.profiles`, `ndk.sessions`, etc.
- ✅ **Consistent runes**: All return `{ value }` or `{ ...fields }`
- ✅ **Zero config**: Works with `createNDK()` alone
- ✅ **Progressive**: Add features as needed
- ✅ **Discoverable**: Autocomplete shows everything
- ✅ **Testable**: Mock one thing (`ndk`)

### Key Insight

The current implementation is **very close** to excellence. The main issues are:

1. **API inconsistency** - Easily fixed by normalizing return types
2. **Scattered imports** - Solved by namespacing under `ndk`
3. **Dual initialization** - Fixed by making `createNDK()` the only way

The underlying architecture (global stores + runes + reactive classes) is **sound** and Svelte 5 idiomatic. It just needs **consistency** and **polish**.

---

## Action Items

1. ✅ Unify all rune return types
2. ✅ Namespace stores under `ndk`
3. ✅ Make `createNDK()` the single entry point
4. ✅ Document: "Direct access vs Runes"
5. ✅ Add subscription deduplication
6. ✅ Optimize profile fetching batching
7. ✅ Add optimistic updates to payments
8. ✅ Create comprehensive examples
