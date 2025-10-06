# NDK-Svelte5 Architecture Analysis

## Executive Summary

After deep analysis of ndk-core, ndk-wallet, wot, and ndk-svelte5, I've identified **fundamental architectural issues** in ndk-svelte5 that violate the design principles established by the other NDK packages.

**Core Problem**: ndk-svelte5 creates unnecessary abstractions, global singletons, and wrapper stores that duplicate functionality already present in ndk-core and other packages.

---

## 1. Established Patterns in NDK Ecosystem

### ndk-core Design Principles
- **Direct API**: Clean methods like `ndk.subscribe()`, `ndk.fetchEvent()`, `ndk.getUser()`
- **No magic**: Explicit over implicit
- **Composable**: Classes can be instantiated multiple times
- **EventEmitter pattern**: For lifecycle events
- **Returns native types**: NDKSubscription, NDKEvent, NDKUser, etc.

### ndk-wallet Design Principles
- **Base class + implementations**: NDKWallet base, specific implementations extend it
- **Direct integration**: `wallet.ndk = ndk`
- **Clear interface**: `lnPay()`, `cashuPay()`, `balance` getter
- **No wrappers**: You use wallet instances directly

### wot Design Principles
- **Instance-based**: `new NDKWoT(ndk, rootPubkey)`
- **Pure functions**: `filterByWoT()`, `rankByWoT()` as standalone functions
- **No global state**: Create instances as needed
- **Simple API**: `load()`, `getScore()`, `includes()`

---

## 2. Critical Issues in ndk-svelte5

### Issue #1: NDKSvelte is Pointless

**Location**: `ndk-svelte5/src/lib/ndk-svelte.ts`

```typescript
export class NDKSvelte extends NDK {
    constructor(params?: NDKConstructorParams) {
        super(params);
    }
}
```

**Problems**:
- Adds ZERO functionality
- Creates unnecessary type divergence
- Users should just use `NDK` directly

**Fix**: Delete NDKSvelte entirely. Use NDK everywhere.

---

### Issue #2: createNDK() Has Too Many Responsibilities

**Location**: `ndk-svelte5/src/lib/ndk.svelte.ts:76`

```typescript
export function createNDK(options: CreateNDKOptions = {}): NDK {
    // Auto-detects cache
    // Auto-connects
    // Initializes global stores
    // Returns NDK instance
}
```

**Problems**:
1. **Magic auto-detection**: Tries to auto-detect SQLite cache, adds console logs
2. **Side effects**: Calls `initStores()` which modifies global singletons
3. **Unclear ownership**: Returns NDK but has already wired it to global stores
4. **Violates single responsibility**: Does initialization, configuration, connection, AND store setup

**Violation of NDK philosophy**: ndk-core is explicit. This is magic.

**Fix**: Split into:
- `createNDK()`: Just creates NDK instance, no side effects
- `connectNDK()`: Handles connection
- Stores should be passed NDK explicitly, not auto-initialized

---

### Issue #3: Global Singleton Stores Break Composability

**Location**: `ndk-svelte5/src/lib/index.ts:26-62`

```typescript
export const profiles = new ProfileStore();
export const sessions = new SessionStore();
export const mutes = new MuteStore();
export const wallet = new WalletStore();
export const pool = new PoolStore();
export const wot = new WoTStore();

export async function initStores(ndk: NDKSvelte, options) {
    profiles.init(ndk);
    await sessions.init(ndk, options?.sessionStorage);
    mutes.init(ndk);
    wallet.init(ndk);
    pool.init(ndk);
    wot.init(ndk);
}
```

**Problems**:
1. **Global singletons**: One store instance for entire app
2. **NDK is NOT a singleton**: You can create multiple NDK instances
3. **Mismatch**: Multiple NDK instances, but only ONE set of stores
4. **Impossible to isolate**: Can't have different stores for different NDK instances
5. **Testing nightmare**: Global mutable state

**Real-world failure case**:
```svelte
<script>
  const ndk1 = createNDK({ explicitRelayUrls: ['wss://relay1.com'] });
  const ndk2 = createNDK({ explicitRelayUrls: ['wss://relay2.com'] });

  // Which NDK does `profiles` use? Last one initialized!
  // This is broken.
</script>
```

**Violation**: ndk-wallet doesn't have a global wallet store. wot doesn't have a global wot store. Why does ndk-svelte5?

**Fix**: Make stores context-based or instance-based, not global.

---

### Issue #4: Wallet Store Unnecessarily Wraps ndk-wallet

**Location**: `ndk-svelte5/src/lib/stores/wallet.svelte.ts`

**The wrapper store**:
- 737 lines of code
- Wraps NDKWallet/NDKCashuWallet/NDKNWCWallet
- Re-implements transaction tracking
- Re-implements nutzap monitoring
- Re-implements balance tracking
- Adds proof management
- Adds mint blacklisting

**Problems**:
1. **Massive duplication**: ndk-wallet already has these features
2. **Inconsistent API**: Different from ndk-wallet's API
3. **Maintenance burden**: Changes to ndk-wallet need changes here
4. **Confusing ownership**: Where does wallet state live? In NDKWallet or WalletStore?

**Example of duplication**:
```typescript
// ndk-wallet already has:
wallet.on('balance_updated', (balance) => { /* ... */ })
wallet.balance

// But wallet store re-implements:
balance = $state<number>(0);
private async updateBalance() { /* custom logic */ }
```

**Violation**: ndk-wallet is designed to be used DIRECTLY. You shouldn't wrap it.

**Fix**: Delete WalletStore. Use NDKWallet instances directly in components.

---

### Issue #5: Session Store Re-implements NDK User Management

**Location**: `ndk-svelte5/src/lib/stores/sessions.svelte.ts`

**What it does**:
- Manages multiple sessions (pubkey + signer + profile + follows + mutes)
- Switches active session
- Persists sessions to storage
- Loads user data (follows, mutes, relays)

**Problems**:
1. **NDK already has**: `ndk.signer`, `ndk.activeUser`
2. **Mixing concerns**: Session management + storage + user data loading
3. **Complex state**: 327 lines for something that could be simpler
4. **Tight coupling**: Directly modifies `ndk.signer` when switching

**The session abstraction may be useful**, but it's doing too much.

**Violations**:
- ndk-core manages active user via `ndk.activeUser`
- This re-implements that at a higher level
- Storage concerns should be separate from session management

**Fix**:
- Keep session storage (save/load signers)
- Remove the state management parts (just use ndk.activeUser)
- Or make it simpler and more focused

---

### Issue #6: Profile Store Has Magic Auto-Fetching

**Location**: `ndk-svelte5/src/lib/stores/profiles.svelte.ts:24`

```typescript
get(pubkey: string): NDKUserProfile | undefined {
    if (!this.cache.has(pubkey) && !this.pending.has(pubkey) && this.ndk) {
        this.fetch([pubkey]);  // ⚠️ Side effect!
    }
    return this.cache.get(pubkey);
}
```

**Problems**:
1. **Magic behavior**: Calling a getter starts a subscription
2. **Unpredictable**: You don't know when network requests happen
3. **No control**: Can't prevent the fetch

**Better API**:
```typescript
// Explicit
profiles.fetch([pubkey]);
const profile = profiles.get(pubkey);

// Or reactive
const profile = await profiles.get(pubkey); // Returns promise
```

**Fix**: Make fetching explicit, not automatic.

---

### Issue #7: WoT Store Wraps NDKWoT Unnecessarily

**Location**: `ndk-svelte5/src/lib/stores/wot.svelte.ts`

**What it does**:
- Wraps NDKWoT instances
- Manages map of pubkey -> NDKWoT
- Auto-switches WoT when session changes
- Auto-filters subscriptions
- Auto-reloads on session change

**Problems**:
1. **Complex wrapper**: Could just use NDKWoT directly
2. **Global singleton**: Same issue as other stores
3. **Hidden behavior**: Auto-filter on ALL subscriptions is surprising

**Violations**:
- wot is designed to be instantiated: `new NDKWoT(ndk, pubkey)`
- You're supposed to use it directly
- Filtering is via pure functions: `filterByWoT(wot, events, options)`

**Better approach**:
```typescript
// Component-level WoT
const myWot = $state(new NDKWoT(ndk, pubkey));
await myWot.load({ depth: 2 });

// Filter explicitly in subscriptions
const sub = createSubscription(ndk, filters, {
  transform: (events) => filterByWoT(myWot, events, { maxDepth: 2 })
});
```

**Fix**: Remove global WoT store. Let users create NDKWoT instances where needed.

---

### Issue #8: Payments Store + Wallet Store Confusion

**Locations**:
- `ndk-svelte5/src/lib/stores/payments.svelte.ts`
- `ndk-svelte5/src/lib/stores/wallet.svelte.ts`

**The problem**:
- Wallet store has `history: Transaction[]`
- Payments store has pending payments tracking
- Both deal with payment state
- Unclear where payment state should live

**Fix**: Unify. One source of truth for payments.

---

### Issue #9: Pool Store is Redundant

**Location**: `ndk-svelte5/src/lib/stores/pool.svelte.ts`

NDK already has `ndk.pool` which is a `NDKPool` instance with:
- Relay connections
- Connection status
- Events for relay connect/disconnect

**The pool store just wraps this**. Pointless.

**Fix**: Delete pool store. Use `ndk.pool` directly.

---

## 3. What ndk-svelte5 Gets RIGHT

Not everything is bad! These are good:

### ✅ createSubscription()
**Location**: `ndk-svelte5/src/lib/subscribe.svelte.ts`

```typescript
const notes = createSubscription(ndk, { kinds: [1], limit: 50 });
// notes.events, notes.latest, notes.count are all reactive
```

**Why it's good**:
- Clean reactive wrapper around `ndk.subscribe()`
- Proper abstraction level
- Integrates with Svelte 5 runes
- Handles deduplication
- Supports reactive filters
- Optional WoT filtering

**This is the RIGHT level of abstraction for ndk-svelte5**.

---

### ✅ useUser()
**Location**: `ndk-svelte5/src/lib/user.svelte.ts`

```typescript
const user = useUser(ndk, 'npub1...');
// user.pubkey, user.npub, user.profile are all reactive
```

**Why it's good**:
- Resolves user identifiers (npub, NIP-05, hex)
- Returns reactive object
- Clean API
- Focused responsibility

---

### ✅ Blossom Utilities
**Locations**:
- `ndk-svelte5/src/lib/blossom-upload.svelte.ts`
- `ndk-svelte5/src/lib/blossom-url.svelte.ts`

**Why they're good**:
- Focused on Blossom protocol
- Clean reactive state
- Proper abstraction of upload/URL logic
- Not global - you call `useBlossomUpload()` to create instances

---

## 4. The RIGHT Design for ndk-svelte5

### Core Principles

1. **No global singletons** - Everything context-based or instance-based
2. **Use NDK directly** - No NDKSvelte, no wrappers
3. **Thin reactive wrappers only** - Like createSubscription and useUser
4. **Explicit over magic** - No auto-fetching, no auto-initialization
5. **Match ndk-core philosophy** - Direct API, composable, no magic

### Recommended Architecture

```typescript
// ❌ OLD (bad)
const ndk = createNDK(); // Magic initialization, global stores
const profile = profiles.get(pubkey); // Auto-fetches, global

// ✅ NEW (good)
const ndk = new NDK({ explicitRelayUrls: [...] });
await ndk.connect();

// Use ndk-wallet directly
const wallet = new NDKCashuWallet(ndk);
await wallet.start({ pubkey });

// Use NDKWoT directly
const wot = new NDKWoT(ndk, pubkey);
await wot.load({ depth: 2 });

// Use reactive wrappers for Svelte integration
const notes = createSubscription(ndk, { kinds: [1] });
const user = useUser(ndk, 'npub1...');
```

### What ndk-svelte5 Should Be

```
ndk-svelte5/
├── subscription.svelte.ts    (createSubscription - keep)
├── user.svelte.ts            (useUser - keep)
├── blossom-upload.svelte.ts  (keep)
├── blossom-url.svelte.ts     (keep)
├── context.ts                (NEW: Svelte context for NDK)
├── session-storage.ts        (keep for persistence)
└── components/               (keep Avatar, BlossomImage)
```

**Total**: ~500 lines instead of 3000+

---

## 5. Specific Refactoring Recommendations

### 1. Remove Global Stores

**Delete**:
- `stores/profiles.svelte.ts` (use NDKUser directly)
- `stores/wallet.svelte.ts` (use NDKWallet directly)
- `stores/wot.svelte.ts` (use NDKWoT directly)
- `stores/pool.svelte.ts` (use ndk.pool directly)
- `stores/mutes.svelte.ts` (use ndk.mutedIds directly)
- `stores/payments.svelte.ts` (use wallet transaction tracking)

**Keep**:
- `stores/session-storage.ts` (for persistence only)
- Consider keeping sessions store if simplified

---

### 2. Simplify Session Management

**Option A: Minimal**
```typescript
// Just save/load signers
export async function loadSigner(storage: Storage): Promise<NDKSigner | null>;
export async function saveSigner(storage: Storage, signer: NDKSigner): Promise<void>;

// Use ndk.activeUser for everything else
```

**Option B: Keep Sessions but Simplify**
```typescript
// Focused on multi-account management
class SessionManager {
  async addAccount(signer: NDKSigner): Promise<void>;
  async switchAccount(pubkey: string): Promise<void>;
  async removeAccount(pubkey: string): Promise<void>;
  get accounts(): Array<{ pubkey: string, signer: NDKSigner }>;
  get current(): { pubkey: string, signer: NDKSigner } | undefined;
}

// Still sets ndk.signer when switching
// Still persists to storage
// But DOESN'T manage follows, mutes, profiles - use NDK for that
```

---

### 3. Add Svelte Context for NDK

```typescript
// context.ts
import { setContext, getContext } from 'svelte';
import type NDK from '@nostr-dev-kit/ndk';

const NDK_CONTEXT_KEY = Symbol('ndk');

export function setNDKContext(ndk: NDK): void {
  setContext(NDK_CONTEXT_KEY, ndk);
}

export function getNDKContext(): NDK {
  const ndk = getContext<NDK>(NDK_CONTEXT_KEY);
  if (!ndk) throw new Error('NDK context not found');
  return ndk;
}
```

**Usage**:
```svelte
<!-- App.svelte -->
<script lang="ts">
  import NDK from '@nostr-dev-kit/ndk';
  import { setNDKContext } from '@nostr-dev-kit/ndk-svelte5';

  const ndk = new NDK({ explicitRelayUrls: [...] });
  ndk.connect();

  setNDKContext(ndk);
</script>

<!-- Child component -->
<script lang="ts">
  import { getNDKContext, createSubscription } from '@nostr-dev-kit/ndk-svelte5';

  const ndk = getNDKContext();
  const notes = createSubscription(ndk, { kinds: [1] });
</script>
```

---

### 4. Profile Fetching Pattern

**Instead of global profiles store**:

```typescript
// profiles.svelte.ts
export function createProfileCache(ndk: NDK) {
  const cache = $state(new Map<string, NDKUserProfile>());

  async function fetch(pubkeys: string[]): Promise<void> {
    const sub = ndk.subscribe({ kinds: [0], authors: pubkeys });
    sub.on('event', (event) => {
      cache.set(event.pubkey, JSON.parse(event.content));
    });
  }

  function get(pubkey: string): NDKUserProfile | undefined {
    return cache.get(pubkey);
  }

  return { cache, fetch, get };
}

// Usage
const profiles = createProfileCache(ndk);
await profiles.fetch([pubkey1, pubkey2]);
const profile = profiles.get(pubkey1);
```

**Or even simpler - use NDKUser**:
```typescript
const user = ndk.getUser({ pubkey });
await user.fetchProfile();
// user.profile is now populated
```

---

### 5. Wallet Usage Pattern

**Just use ndk-wallet directly**:

```svelte
<script lang="ts">
  import { NDKCashuWallet } from '@nostr-dev-kit/ndk-wallet';

  const wallet = new NDKCashuWallet(ndk);
  await wallet.start({ pubkey: user.pubkey });

  let balance = $state(wallet.balance?.amount ?? 0);

  wallet.on('balance_updated', (b) => {
    balance = b?.amount ?? 0;
  });

  async function pay(amount: number) {
    await wallet.lnPay({ amount, unit: 'sat' });
  }
</script>

<div>
  Balance: {balance} sats
  <button onclick={() => pay(1000)}>Pay 1000 sats</button>
</div>
```

**No wrapper store needed!**

---

### 6. WoT Usage Pattern

**Just use NDKWoT directly**:

```svelte
<script lang="ts">
  import { NDKWoT, filterByWoT } from '@nostr-dev-kit/wot';
  import { createSubscription } from '@nostr-dev-kit/ndk-svelte5';

  const wot = $state(new NDKWoT(ndk, user.pubkey));

  $effect(() => {
    wot.load({ depth: 2, maxFollows: 1000 });
  });

  const notes = createSubscription(ndk, { kinds: [1] }, {
    transform: (events) => filterByWoT(wot, events, { maxDepth: 2 })
  });
</script>
```

**Or add a helper**:
```typescript
// wot.svelte.ts
export function createWoT(ndk: NDK, pubkey: string, options: WoTBuildOptions) {
  const wot = $state(new NDKWoT(ndk, pubkey));
  let loaded = $state(false);

  $effect(() => {
    wot.load(options).then(() => loaded = true);
  });

  return {
    get loaded() { return loaded; },
    getScore: (pubkey: string) => wot.getScore(pubkey),
    includes: (pubkey: string, opts) => wot.includes(pubkey, opts),
    filterEvents: (events) => filterByWoT(wot, events, options),
  };
}
```

---

## 6. Migration Path

### Phase 1: Deprecate but Don't Break
1. Mark NDKSvelte as deprecated
2. Mark global stores as deprecated
3. Add new APIs alongside old ones
4. Update docs to show new patterns

### Phase 2: Provide Migration Guide
```markdown
# Migrating from ndk-svelte5 v1 to v2

## Global stores → Direct usage

**Before:**
```typescript
import { profiles, wallet, wot } from '@nostr-dev-kit/ndk-svelte5';
```

**After:**
```typescript
import NDK from '@nostr-dev-kit/ndk';
import { NDKCashuWallet } from '@nostr-dev-kit/ndk-wallet';
import { NDKWoT } from '@nostr-dev-kit/wot';
```
```

### Phase 3: Remove in Breaking Release
- Remove NDKSvelte
- Remove global stores
- Keep only thin reactive wrappers

---

## 7. Summary

### The Core Issues

1. ❌ **NDKSvelte** - Pointless wrapper
2. ❌ **createNDK()** - Too much magic
3. ❌ **Global stores** - Breaks composability
4. ❌ **Wallet store** - Unnecessary wrapper
5. ❌ **Session store** - Too complex
6. ❌ **Profile store** - Magic auto-fetching
7. ❌ **WoT store** - Wraps NDKWoT unnecessarily
8. ❌ **Pool store** - Wraps ndk.pool

### What to Keep

1. ✅ **createSubscription()** - Perfect abstraction
2. ✅ **useUser()** - Clean reactive wrapper
3. ✅ **Blossom utilities** - Focused and useful
4. ✅ **Session storage** - Persistence is fine
5. ✅ **Components** - Avatar, BlossomImage

### The Right Design

**ndk-svelte5 should provide**:
- Thin reactive wrappers for Svelte 5 runes integration
- Utility functions for common patterns
- Svelte context helpers
- Component primitives

**ndk-svelte5 should NOT provide**:
- Global state management
- Wrappers around ndk-wallet
- Wrappers around ndk-wot
- Re-implementations of NDK features
- Magic auto-initialization

### The Philosophy

**Follow ndk-core's lead**:
- Direct API usage
- Explicit over implicit
- Composable instances
- No magic
- Thin wrappers only where needed for framework integration

---

## Appendix: File-by-File Recommendations

| File | Action | Reason |
|------|--------|--------|
| `ndk-svelte.ts` | **Delete** | Adds nothing |
| `ndk.svelte.ts` | **Simplify** | Remove magic, remove initStores call |
| `subscribe.svelte.ts` | **Keep** | Good abstraction |
| `user.svelte.ts` | **Keep** | Clean utility |
| `blossom-upload.svelte.ts` | **Keep** | Focused utility |
| `blossom-url.svelte.ts` | **Keep** | Focused utility |
| `stores/profiles.svelte.ts` | **Delete** | Use NDKUser directly |
| `stores/sessions.svelte.ts` | **Simplify** | Keep storage, remove state mgmt |
| `stores/wallet.svelte.ts` | **Delete** | Use NDKWallet directly |
| `stores/wot.svelte.ts` | **Delete** | Use NDKWoT directly |
| `stores/pool.svelte.ts` | **Delete** | Use ndk.pool directly |
| `stores/mutes.svelte.ts` | **Delete** | Use ndk.mutedIds directly |
| `stores/payments.svelte.ts` | **Delete** | Use wallet transaction tracking |
| `payments/runes.svelte.ts` | **Delete** | Use wallet methods directly |
| `wot-runes.svelte.ts` | **Simplify** | Helper functions OK, no store |

**Result**: ~3000 lines → ~500 lines of focused, clean code.

---

## Conclusion

The fundamental issue is **unnecessary abstraction layers**.

ndk-core, ndk-wallet, and wot are designed to be used directly. They have clean APIs, are composable, and follow explicit patterns.

ndk-svelte5 should **enhance** that with Svelte-specific reactivity, not **replace** it with wrapper stores.

The right path forward:
1. Remove global singletons
2. Remove unnecessary wrappers
3. Keep reactive utilities (createSubscription, useUser)
4. Add context helpers
5. Let users use NDK, NDKWallet, NDKWoT directly

This aligns with your directive: "Don't create unnecessary type wrappings, or unnecessary services that simply wrap publishing nostr events, just use NDK directly."
