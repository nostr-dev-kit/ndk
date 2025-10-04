# Migration Guide

## Table of Contents
1. [New createNDK API](#new-createndk-api)
2. [Migrating from ndk-svelte](#migrating-from-ndk-svelte)

---

# New createNDK API

## Simplified Initialization

ndk-svelte5 now provides `createNDK()` - a one-liner that replaces verbose initialization.

### Before (Old Pattern)

```typescript
import NDK from '@nostr-dev-kit/ndk';
import { initStores } from '@nostr-dev-kit/ndk-svelte5';

const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol']
});

initStores(ndk).then(() => {
  ndk.connect();
});
```

### After (New Pattern)

```typescript
import { createNDK } from '@nostr-dev-kit/ndk-svelte5';

const ndk = createNDK();
```

That's it! No more boilerplate.

## What createNDK Does

`createNDK()` automatically:
- Creates the NDK instance
- Connects to relays (uses sensible defaults)
- Initializes all stores: sessions, profiles, mutes, wallet, pool, wot
- Restores sessions from localStorage

## Default Configuration

With zero configuration:
- **Relays**: wss://relay.damus.io, wss://nos.lol, wss://relay.nostr.band
- **Auto-connect**: true
- **Session storage**: localStorage
- **WoT**: disabled (opt-in)

## Configuration Options

### Custom Relays
```typescript
const ndk = createNDK({
  explicitRelayUrls: ['wss://relay.damus.io']
});
```

### Disable Auto-Connect
```typescript
const ndk = createNDK({ autoConnect: false });
await ndk.connect(); // connect manually
```

### Ephemeral Sessions
```typescript
const ndk = createNDK({ sessionStorage: false });
```

### Auto-Load WoT
```typescript
const ndk = createNDK({
  wot: { depth: 2, maxFollows: 1000 }
});

// Note: autoReload is not supported in createNDK() options
// Enable it manually from component context:
import { wot } from '@nostr-dev-kit/ndk-svelte5';
import { onMount } from 'svelte';

onMount(() => {
  wot.enableAutoReload();
});
```

### All Options
```typescript
const ndk = createNDK({
  // Relay configuration
  explicitRelayUrls: ['wss://relay.damus.io'],

  // Auto-connect
  autoConnect: true,

  // Session persistence
  sessionStorage: false, // or custom adapter

  // Web of Trust
  wot: { depth: 2, maxFollows: 1000 },

  // Any NDK constructor options
  outboxRelayUrls: ['wss://purplepag.es'],
  enableOutboxModel: true,
});
```

## Migration from Old Pattern

Simply replace your initialization code:

```diff
- import NDK from '@nostr-dev-kit/ndk';
- import { initStores } from '@nostr-dev-kit/ndk-svelte5';
+ import { createNDK } from '@nostr-dev-kit/ndk-svelte5';

- const ndk = new NDK({
-   explicitRelayUrls: ['wss://relay.damus.io']
- });
-
- initStores(ndk).then(() => {
-   ndk.connect();
- });
+ const ndk = createNDK();
```

## Note

The old `initStores()` pattern still works - no breaking changes. But `createNDK()` is recommended for new code.

---

# Migrating from ndk-svelte

## Overview

ndk-svelte5 is a complete reimagining for Svelte 5. It's **not backwards compatible** - it's a fresh start with modern patterns.

## Key Differences

| Feature | ndk-svelte (Svelte 4) | ndk-svelte5 (Svelte 5) |
|---------|----------------------|------------------------|
| Reactivity | Stores (`$store`) | Runes (`$state`, `$derived`) |
| API | `$ndk.storeSubscribe()` | `ndk.subscribe()` |
| Cleanup | Manual `unsubscribe()` | Automatic |
| Type Safety | Partial | Full |
| Performance | Good | Excellent (buffered) |
| Global State | Stores | Reactive stores + runes |
| Components | None | Included |

## Side-by-Side Comparison

### Basic Subscription

**ndk-svelte:**
```svelte
<script lang="ts">
import { onDestroy } from 'svelte';

const store = $ndk.storeSubscribe(
  [{ kinds: [1] }],
  { closeOnEose: false }
);

onDestroy(() => {
  store.unsubscribe();
});
</script>

{#each $store as event}
  {event.content}
{/each}
```

**ndk-svelte5:**
```svelte
<script lang="ts">
const notes = ndk.subscribe([{ kinds: [1] }]);
</script>

{#each notes.events as event}
  {event.content}
{/each}
```

**Benefits:**
- No manual cleanup
- No `$` prefix confusion
- Cleaner, more intuitive

### With Event Class

**ndk-svelte:**
```svelte
<script lang="ts">
import { NDKHighlight } from '@nostr-dev-kit/ndk';

const store = $ndk.storeSubscribe(
  [{ kinds: [9802] }],
  { closeOnEose: false },
  NDKHighlight
);
</script>

{#each $store as highlight}
  {highlight.highlightedContent}
{/each}
```

**ndk-svelte5:**
```svelte
<script lang="ts">
import { NDKHighlight } from '@nostr-dev-kit/ndk';

const highlights = ndk.subscribe<NDKHighlight>(
  [{ kinds: [9802] }],
  { eventClass: NDKHighlight }
);
</script>

{#each highlights.events as highlight}
  {highlight.highlightedContent}
{/each}
```

**Benefits:**
- Type parameter for better inference
- Named options (clearer intent)

### Reference Counting

**ndk-svelte:**
```svelte
<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { highlightsStore } from '$lib/stores';

onMount(() => {
  highlightsStore.ref();
});

onDestroy(() => {
  highlightsStore.unref();
});
</script>

{#each $highlightsStore as highlight}
  {highlight.content}
{/each}
```

**ndk-svelte5:**
```svelte
<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { highlightsSubscription } from '$lib/stores';

onMount(() => highlightsSubscription.ref());
onDestroy(() => highlightsSubscription.unref());
</script>

{#each highlightsSubscription.events as highlight}
  {highlight.content}
{/each}
```

**Benefits:**
- No `$` prefix needed
- Same pattern, cleaner syntax

### Profiles

**ndk-svelte:**
```svelte
<script lang="ts">
// Not built-in, manual implementation needed
import { onMount } from 'svelte';

let profile = $state(undefined);

onMount(async () => {
  const user = ndk.getUser({ pubkey });
  await user.fetchProfile();
  profile = user.profile;
});
</script>

{#if profile}
  <img src={profile.image} alt={profile.name} />
{/if}
```

**ndk-svelte5:**
```svelte
<script lang="ts">
import { profiles } from '@nostr-dev-kit/ndk-svelte5/stores';

const profile = $derived(profiles.get(pubkey));
</script>

{#if profile}
  <img src={profile.image} alt={profile.name} />
{/if}
```

**Benefits:**
- Built-in profile management
- Automatic fetching and caching
- Reactive by default

### Sessions

**ndk-svelte:**
```svelte
<script lang="ts">
// Manual implementation needed
let currentUser = $state(undefined);

async function login() {
  const signer = /* get signer */;
  ndk.signer = signer;
  currentUser = await ndk.signer.user();
}
</script>
```

**ndk-svelte5:**
```svelte
<script lang="ts">
import { sessions } from '@nostr-dev-kit/ndk-svelte5/stores';

async function login() {
  const signer = /* get signer */;
  await sessions.login(signer);
}
</script>

{#if sessions.current}
  <p>Logged in as {sessions.current.profile?.name}</p>
{/if}
```

**Benefits:**
- Built-in session management
- Multi-user support
- Profile auto-loaded

## Feature Mapping

### Subscriptions

| ndk-svelte | ndk-svelte5 | Notes |
|------------|-------------|-------|
| `storeSubscribe()` | `subscribe()` | Cleaner name |
| `store.unsubscribe()` | Automatic | No manual cleanup |
| `$store` | `subscription.events` | No prefix needed |
| `store.ref()` | `subscription.ref()` | Same API |
| `store.unref()` | `subscription.unref()` | Same API |
| `store.changeFilters()` | `subscription.changeFilters()` | Same API |
| `store.empty()` | `subscription.clear()` | Better name |

### Options

| ndk-svelte | ndk-svelte5 | Notes |
|------------|-------------|-------|
| `closeOnEose` | `autoStart` | More intuitive |
| Third param for class | `eventClass` option | Named parameter |
| `repostsFilters` | `reposts.filters` | Nested object |
| N/A | `bufferMs` | New: performance |
| N/A | `skipDeleted` | New: auto-filter |
| N/A | `skipMuted` | New: auto-filter |

## Migration Steps

### 1. Update Dependencies

```bash
# Remove old package
pnpm remove @nostr-dev-kit/ndk-svelte

# Add new package
pnpm add @nostr-dev-kit/ndk-svelte5
```

### 2. Update Svelte

Make sure you're on Svelte 5:

```bash
pnpm add svelte@^5.0.0
```

### 3. Update NDK Instance

**Before:**
```typescript
import NDKSvelte from '@nostr-dev-kit/ndk-svelte';

const ndk = new NDKSvelte({ explicitRelayUrls: [...] });
```

**After:**
```typescript
import { NDKSvelte } from '@nostr-dev-kit/ndk-svelte5';

const ndk = new NDKSvelte({ explicitRelayUrls: [...] });
```

### 4. Update Subscriptions

**Before:**
```svelte
<script lang="ts">
import { onDestroy } from 'svelte';

const store = $ndk.storeSubscribe([{ kinds: [1] }]);
onDestroy(() => store.unsubscribe());
</script>

{#each $store as event}
  <Event {event} />
{/each}
```

**After:**
```svelte
<script lang="ts">
const notes = ndk.subscribe([{ kinds: [1] }]);
</script>

{#each notes.events as event}
  <Event {event} />
{/each}
```

### 5. Remove Manual Cleanup

Delete all `onDestroy()` cleanup code - it's automatic now!

### 6. Use New Stores

Add profile, session, and mute management:

```typescript
import { profiles, sessions, mutes } from '@nostr-dev-kit/ndk-svelte5/stores';
```

### 7. Update Components

Use built-in components where possible:

```svelte
import { UserAvatar, UserName } from '@nostr-dev-kit/ndk-svelte5/components';

<UserAvatar {pubkey} size="lg" />
<UserName {pubkey} />
```

## Common Patterns

### Pattern: Event Feed

**Before:**
```svelte
<script lang="ts">
import { onDestroy } from 'svelte';

const feed = $ndk.storeSubscribe([{ kinds: [1], limit: 50 }]);

onDestroy(() => feed.unsubscribe());
</script>

{#each $feed as note}
  <article>{note.content}</article>
{/each}
```

**After:**
```svelte
<script lang="ts">
const feed = ndk.subscribe([{ kinds: [1], limit: 50 }]);
</script>

{#each feed.events as note}
  <article>{note.content}</article>
{/each}
```

### Pattern: User Profile

**Before:**
```svelte
<script lang="ts">
import { onMount } from 'svelte';

let profile = $state(undefined);

onMount(async () => {
  const user = ndk.getUser({ pubkey });
  await user.fetchProfile();
  profile = user.profile;
});
</script>

{#if profile}
  <h1>{profile.name}</h1>
{/if}
```

**After:**
```svelte
<script lang="ts">
import { profiles } from '@nostr-dev-kit/ndk-svelte5/stores';

const profile = $derived(profiles.get(pubkey));
</script>

{#if profile}
  <h1>{profile.name}</h1>
{/if}
```

### Pattern: Filtered Events

**Before:**
```svelte
<script lang="ts">
import { derived } from 'svelte/store';

const allEvents = $ndk.storeSubscribe([{ kinds: [1] }]);
const filtered = derived(allEvents, $events =>
  $events.filter(e => !isMuted(e.pubkey))
);
</script>

{#each $filtered as event}
  <Event {event} />
{/each}
```

**After:**
```svelte
<script lang="ts">
const events = ndk.subscribe([{ kinds: [1] }], {
  skipMuted: true // Automatic filtering
});
</script>

{#each events.events as event}
  <Event {event} />
{/each}
```

## Breaking Changes

### 1. No `$` Prefix

Subscriptions are not Svelte stores - they're reactive classes.

**Before:** `$store`
**After:** `subscription.events`

### 2. Manual Cleanup Removed

No more `onDestroy()` needed - cleanup is automatic.

### 3. Different Import Path

**Before:** `@nostr-dev-kit/ndk-svelte`
**After:** `@nostr-dev-kit/ndk-svelte5`

### 4. Options Object

Event class is now passed as an option, not a third parameter.

**Before:** `storeSubscribe(filters, opts, EventClass)`
**After:** `subscribe(filters, { eventClass: EventClass })`

### 5. Method Names

Some methods have been renamed for clarity:

- `empty()` → `clear()`
- `closeOnEose` option → removed (use `autoStart`)

## Gradual Migration

You can run both libraries side-by-side during migration:

```typescript
// Old code still using ndk-svelte
import NDKSvelte from '@nostr-dev-kit/ndk-svelte';
const oldNdk = new NDKSvelte({ ... });

// New code using ndk-svelte5
import { NDKSvelte as NDKSvelte5 } from '@nostr-dev-kit/ndk-svelte5';
const ndk = new NDKSvelte5({ ... });
```

Migrate components one by one, then remove the old package when done.

## FAQ

### Why break compatibility?

Svelte 5 is a fundamental shift. Embracing runes fully requires new patterns that don't map to the old API.

### Can I use ndk-svelte5 with Svelte 4?

No. ndk-svelte5 requires Svelte 5. Continue using ndk-svelte for Svelte 4 projects.

### Will ndk-svelte be maintained?

ndk-svelte will receive critical bug fixes, but new features will only be added to ndk-svelte5.

### Is the migration worth it?

Yes! Benefits include:
- Simpler code (less boilerplate)
- Better performance (buffering)
- Type safety
- Built-in features (profiles, sessions)
- Automatic cleanup
- Modern patterns

### How long does migration take?

Small apps: 1-2 hours
Medium apps: Half day
Large apps: 1-2 days

The API is intuitive enough that migration is mostly mechanical.

## Help & Support

- **Documentation**: [README.md](./README.md)
- **Examples**: [EXAMPLES.md](./EXAMPLES.md)
- **Issues**: GitHub Issues
- **Discord**: Nostr Dev Kit server

---

**Ready to migrate? The future is bright! ✨**
