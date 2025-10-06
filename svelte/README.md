# @nostr-dev-kit/svelte

> Modern, performant, and beautiful Svelte 5 integration for NDK

A ground-up reimagining of NDK for Svelte 5, built with runes, designed for beauty and performance.

## Philosophy

ndk-svelte5 embraces **Svelte 5's reactive primitives** to create a library that feels native, performs beautifully, and makes building Nostr apps a joy.

- **Runes-first**: Reactive classes using `$state`, `$derived`, and `$effect`
- **Namespaced stores**: All stores under single NDK instance
- **Zero compromises**: No backwards compatibility, pure Svelte 5
- **Performance-focused**: Buffered updates, smart deduplication
- **TypeScript-native**: Full type safety and inference
- **Aesthetic APIs**: Beautiful code that reads like poetry

## Status

**Current Version**: 0.1.0
**Status**: Beta - Core features implemented and tested

### ✅ Implemented Features

- **Core Subscriptions**: Reactive EventSubscription with automatic cleanup
- **Namespaced Stores**: Sessions, WoT, wallet, payments, and pool
- **Advanced Features**: ReactiveEvent and ReactiveFilter classes
- **Wallet Integration**: Full support for Cashu, NWC, and WebLN wallets
- **Payment Tracking**: Reactive payment/transaction tracking with pending state management
- **Nutzap Monitoring**: Automatic nutzap detection and redemption
- **Test Coverage**: 119 tests passing across all core functionality

### 🚧 Coming Soon

- Component library (UserAvatar, UserName, etc.)
- Additional examples
- Performance optimizations
- Documentation site

## Installation

```bash
pnpm add @nostr-dev-kit/svelte
```

## Setup

Initialize NDK in your app:

```typescript
// lib/ndk.ts
import { NDKSvelte } from '@nostr-dev-kit/svelte';
import NDKCacheDexie from '@nostr-dev-kit/ndk-cache-dexie';

export const ndk = new NDKSvelte({
  explicitRelayUrls: [
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
  ],
  cacheAdapter: new NDKCacheDexie({ dbName: 'my-app' })
});

ndk.connect();
```

**Session Persistence:**
Sessions are automatically persisted to localStorage by default. Users stay logged in across page reloads.

## Core Concepts

### 1. Reactive Subscriptions

The heart of ndk-svelte5 is the `subscribe()` method - a reactive, self-managing subscription.

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { NDKKind } from '@nostr-dev-kit/ndk';

// Create a reactive subscription
const notes = ndk.subscribe({ kinds: [NDKKind.Text], limit: 50 });

// Properties are $state runes that automatically trigger reactivity
// when accessed in Svelte templates or $effect blocks
$inspect(notes.events); // Array of events (reactive)
$inspect(notes.eosed);  // EOSE flag (reactive)
$inspect(notes.count);  // Event count (derived)
</script>

{#each notes.events as note}
  <article>{note.content}</article>
{/each}

{#if notes.isEmpty}
  <span>No notes yet</span>
{/if}
```

**Automatic reactivity**: The `events`, `eosed`, `error`, `status`, and `refCount` properties are `$state` runes that automatically trigger reactivity when events arrive and the UI accesses them.

**Automatic cleanup**: The subscription stops when the component unmounts. No manual cleanup needed.

### 2. Reactive Event Classes

Events become reactive objects with `$state` properties:

```svelte
<script lang="ts">
import { ReactiveEvent } from '@nostr-dev-kit/svelte';

const event = ReactiveEvent.from(rawEvent);

// Reactive properties automatically update
$inspect(event.deleted);      // Becomes true if event gets deleted
$inspect(event.reactions);    // Live count of reactions
$inspect(event.zaps);         // Live zap amount in sats
$inspect(event.replyCount);   // Live reply count
</script>

<button onclick={() => event.addReaction('🔥')}>
  {event.reactions.get('🔥') || 0} 🔥
</button>
```

### 3. Namespaced Stores

All stores are namespaced under the NDK instance:

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';

// Session management
const currentUser = ndk.sessions.current;
await ndk.sessions.login(signer);
ndk.sessions.logout();

// Web of Trust
await ndk.wot.load();
const score = ndk.wot.getScore(pubkey);

// Wallet
ndk.wallet.set(myWallet);
const balance = ndk.wallet.balance;

// Payments
const amount = ndk.payments.getZapAmount(event);

// Pool
const connected = ndk.pool.connectedCount;
</script>
```

## Subscription API

### Basic Usage

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';

const sub = ndk.subscribe({ kinds: [1], authors: [pubkey], limit: 100 });

// The subscription has reactive properties
sub.events  // T[] - sorted by created_at desc
sub.eosed   // boolean
sub.count   // number (derived)
sub.isEmpty // boolean (derived)
</script>
```

### With Options

```svelte
<script lang="ts">
const highlights = ndk.subscribe(
  { kinds: [9802], limit: 50 },
  {
    // Buffer events for performance (default: 30ms)
    bufferMs: 30,

    // Convert events to specific class
    eventClass: NDKHighlight,

    // Relay set
    relaySet: myRelaySet,

    // Callbacks
    onEvent: (event) => console.log('New event', event),
    onEose: () => console.log('EOSE reached'),
  }
);
</script>
```

### Manual Control

```svelte
<script lang="ts">
const sub = ndk.subscribe([filters], { autoStart: false });

// Manual control
sub.start();
sub.stop();
sub.restart();
sub.clear(); // Clear events and restart

// Change filters
sub.changeFilters([newFilters]);

// Add/remove individual events
sub.add(event);
sub.remove(eventId);
</script>
```

## Session Management

Built-in multi-user session support with automatic persistence:

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { NDKNip07Signer } from '@nostr-dev-kit/ndk';

// Current session (reactive)
const current = $derived(ndk.sessions.current);
const profile = $derived(ndk.sessions.profile);
const follows = $derived(ndk.sessions.follows);

async function login() {
  const signer = new NDKNip07Signer();
  await ndk.sessions.login(signer);
}

function logout() {
  ndk.sessions.logout();
}
</script>

{#if current}
  <div>
    <p>Logged in as {profile?.name || 'Anonymous'}</p>
    <p>Following {follows.size} accounts</p>
    <button onclick={logout}>Logout</button>
  </div>
{:else}
  <button onclick={login}>Login</button>
{/if}
```

### Session API

```typescript
// Reactive getters
ndk.sessions.current      // NDKSession | undefined
ndk.sessions.currentUser  // NDKUser | undefined
ndk.sessions.profile      // NDKUserProfile | undefined
ndk.sessions.follows      // Set<Hexpubkey>
ndk.sessions.all          // NDKSession[]

// Methods
await ndk.sessions.login(signer, options?)
await ndk.sessions.add(signer, options?)
ndk.sessions.switch(pubkey)
ndk.sessions.logout(pubkey?)
ndk.sessions.logoutAll()
ndk.sessions.get(pubkey)
ndk.sessions.getSessionEvent(kind)
```

## Web of Trust

Powerful WoT filtering and ranking:

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { onMount } from 'svelte';

onMount(async () => {
  if (ndk.sessions.current) {
    // Load WoT data
    await ndk.wot.load({ maxDepth: 2 });

    // Enable automatic filtering on all subscriptions
    ndk.wot.enableAutoFilter({
      maxDepth: 2,
      minScore: 0.5,
      includeUnknown: false
    });
  }
});

// Subscriptions automatically filter by WoT when enabled
const notes = ndk.subscribe({ kinds: [1], limit: 100 });
</script>
```

### WoT API

```typescript
// Load WoT data
await ndk.wot.load({ maxDepth?: number, maxFollows?: number, timeout?: number })

// Enable/disable automatic filtering
ndk.wot.enableAutoFilter(options?)
ndk.wot.disableAutoFilter()

// Query WoT
ndk.wot.getScore(pubkey)              // number (0-1)
ndk.wot.getDistance(pubkey)           // number | null
ndk.wot.includes(pubkey, options?)    // boolean
ndk.wot.shouldFilterEvent(event)      // boolean
ndk.wot.rankEvents(events, options?)  // T[]

// State
ndk.wot.loaded                        // boolean
ndk.wot.autoFilterEnabled             // boolean
```

## Mute Management

Mute management is handled directly by NDK core:

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';

// Mute lists are automatically loaded when user logs in

// Check if muted
const isMuted = ndk.mutedIds.has(pubkey);
const isWordMuted = ndk.muteFilter(event);

// Mute/unmute
ndk.mutedIds.set(pubkey, "p");
ndk.mutedIds.delete(pubkey);

ndk.mutedWords.add("spam");
ndk.mutedWords.delete("spam");
</script>
```

**Performance Note:** Word filtering only runs on content kinds (1, 30023, 4, 1059, 30009, 1311, and kinds 1000-9999). Non-content events are not checked for muted words for performance.

## Wallet Integration

Seamless integration with ndk-wallet:

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { NDKCashuWallet } from '@nostr-dev-kit/ndk-wallet';

// Create and set wallet
const cashuWallet = new NDKCashuWallet(ndk);
await cashuWallet.init();
ndk.wallet.set(cashuWallet);

// Reactive wallet state
const balance = $derived(ndk.wallet.balance);
const connected = $derived(!!ndk.wallet.wallet);
</script>

<p>Balance: {balance} sats</p>
```

### Wallet API

```typescript
// Set/clear wallet
ndk.wallet.set(wallet)
ndk.wallet.clear()
await ndk.wallet.refreshBalance()

// State
ndk.wallet.wallet    // NDKWallet | undefined
ndk.wallet.balance   // number
```

## Payment Tracking

Real-time payment tracking with automatic pending-to-confirmed transitions:

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';

// Reactive payment state
const history = $derived(ndk.payments.history);
const pending = $derived(ndk.payments.pending);
const byTarget = $derived(ndk.payments.byTarget);

// Check zap status
const amount = ndk.payments.getZapAmount(event);
const isZapped = ndk.payments.isZapped(event);
</script>

{#if isZapped}
  <span>⚡ Zapped {amount} sats</span>
{/if}
```

### Payments API

```typescript
// Query payments
ndk.payments.getZapAmount(target)  // number
ndk.payments.isZapped(target)      // boolean

// State
ndk.payments.history     // Transaction[]
ndk.payments.pending     // PendingPayment[]
ndk.payments.byTarget    // Map<string, Transaction[]>
```

## Relay Pool Monitoring

Monitor relay connections:

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';

const connected = $derived(ndk.pool.connectedCount);
const connecting = $derived(ndk.pool.connectingCount);
const relays = $derived(ndk.pool.getConnectedRelays());
</script>

<p>Connected: {connected} | Connecting: {connecting}</p>

<ul>
  {#each relays as relay}
    <li>{relay.url}</li>
  {/each}
</ul>
```

### Pool API

```typescript
// Query relays
ndk.pool.getRelay(url)           // RelayInfo | undefined
ndk.pool.getConnectedRelays()    // RelayInfo[]

// State
ndk.pool.relays            // Map<string, RelayInfo>
ndk.pool.connectedCount    // number
ndk.pool.connectingCount   // number
```

## Advanced Patterns

### Derived Subscriptions

Create derived reactive state from subscriptions:

```svelte
<script lang="ts">
const notes = ndk.subscribe({ kinds: [1], authors: [pubkey] });

// Derived state using $derived
const recentNotes = $derived(
  notes.events.slice(0, 10)
);

const notesByDay = $derived(
  notes.events.reduce((acc, note) => {
    const day = new Date(note.created_at! * 1000).toDateString();
    (acc[day] ??= []).push(note);
    return acc;
  }, {} as Record<string, NDKEvent[]>)
);
</script>
```

### Reactive Filters

Build dynamic filters that automatically update subscriptions:

```svelte
<script lang="ts">
import { ReactiveFilter } from '@nostr-dev-kit/svelte';

let selectedAuthor = $state('');
let selectedKind = $state(1);

// Reactive filter that updates automatically
const filter = new ReactiveFilter();
filter.kinds = [selectedKind];
filter.authors = selectedAuthor ? [selectedAuthor] : undefined;

// Subscription updates when filter changes
const events = ndk.subscribe(filter);
</script>

<select bind:value={selectedKind}>
  <option value={1}>Notes</option>
  <option value={30023}>Long-form</option>
</select>

<!-- Events update automatically when filters change -->
{#each events.events as event}
  <EventCard {event} />
{/each}
```

### Effect Hooks

Run side effects when subscription state changes:

```svelte
<script lang="ts">
const notes = ndk.subscribe({ kinds: [1] });

// Run effect when new events arrive
$effect(() => {
  if (notes.events.length > 0) {
    console.log('New events:', notes.events.length);
    playNotificationSound();
  }
});

// Run once when EOSE is reached
$effect(() => {
  if (notes.eosed) {
    console.log('Initial load complete');
  }
});
</script>
```

### Proper Use of EOSE

The `eosed` flag is for **performance optimization and analytics**, not loading states:

```svelte
<script lang="ts">
const notes = ndk.subscribe({ kinds: [1] });

// ✅ Good: Trigger pagination after initial load
$effect(() => {
  if (notes.eosed && notes.count < 10) {
    notes.fetchMore(20);
  }
});

// ✅ Good: Performance analytics
$effect(() => {
  if (notes.eosed) {
    console.log(`Loaded ${notes.count} events`);
  }
});

// ❌ Bad: Blocking UI
// {#if !notes.eosed}<Spinner />{/if}
</script>

<!-- Just render events as they stream in -->
{#each notes.events as note}
  <Note {note} />
{/each}
```

## Performance

### Buffered Updates

By default, events are buffered for 30ms to batch DOM updates:

```svelte
<script lang="ts">
// High-frequency updates (default)
const sub1 = ndk.subscribe(filters, {
  bufferMs: 30 // Batch updates every 30ms
});

// Real-time updates (no buffering)
const sub2 = ndk.subscribe(filters, {
  bufferMs: false // Update immediately
});
</script>
```

### Smart Deduplication

Events are automatically deduplicated using NDK's deduplication keys:

```svelte
<script lang="ts">
// Duplicate events are automatically filtered
const sub = ndk.subscribe([
  { kinds: [1], authors: [pubkey] },
  { kinds: [1], '#p': [pubkey] }
]);

// Only unique events appear in sub.events
// Replaceable events are automatically replaced with newer versions
</script>
```

## Type Safety

Full TypeScript support with smart type inference:

```typescript
import { ndk } from '$lib/ndk';
import { NDKHighlight } from '@nostr-dev-kit/ndk';

// Type is inferred as EventSubscription<NDKHighlight>
const highlights = ndk.subscribe<NDKHighlight>(
  { kinds: [9802] },
  { eventClass: NDKHighlight }
);

// highlights.events is NDKHighlight[]
highlights.events[0].highlightedContent; // Type-safe
```

## Migration from ndk-svelte

```svelte
<!-- Old (ndk-svelte) -->
<script lang="ts">
import { onDestroy } from 'svelte';

const store = $ndk.storeSubscribe({ kinds: [1] });

onDestroy(() => {
  store.unsubscribe();
});
</script>

{#each $store as event}
  {event.content}
{/each}

<!-- New (ndk-svelte5) -->
<script lang="ts">
const sub = ndk.subscribe({ kinds: [1] });
// No manual cleanup needed
</script>

{#each sub.events as event}
  {event.content}
{/each}
```

## Architecture

### Class Hierarchy

```
NDKSvelte (extends NDK)
├── subscribe() → Subscription<T>
├── sessions → ReactiveSessionsStore
├── wot → ReactiveWoTStore
├── wallet → ReactiveWalletStore
├── payments → ReactivePaymentsStore
└── pool → ReactivePoolStore

Subscription<T>
├── events: T[] (reactive)
├── eosed: boolean (reactive)
├── count: number (derived)
├── isEmpty: boolean (derived)
├── start(), stop(), restart()
└── changeFilters(), clear()

ReactiveEvent (extends NDKEvent)
├── deleted: boolean (reactive)
├── reactions: Map<string, number> (reactive)
├── zaps: number (reactive)
└── replies: number (reactive)
```

## Examples

See the [examples](./examples) directory for complete working examples:

- [Basic Feed](./examples/basic-feed) - Simple note feed with profiles ✅
- [Nutsack](./examples/nutsack) - NIP-60 Cashu wallet with payment tracking ✅

### Coming Soon

- Multi-user App - Account switching and management
- Real-time Chat - Messaging with DMs
- Advanced Patterns - Complex reactive patterns

## API Reference

### NDKSvelte

```typescript
class NDKSvelte extends NDK {
  // Namespaced stores
  sessions: ReactiveSessionsStore;
  wot: ReactiveWoTStore;
  wallet: ReactiveWalletStore;
  payments: ReactivePaymentsStore;
  pool: ReactivePoolStore;

  // Subscription
  subscribe<T extends NDKEvent>(
    filters: NDKFilter | NDKFilter[],
    opts?: SubscriptionOptions
  ): Subscription<T>;
}
```

### Subscription

```typescript
class Subscription<T extends NDKEvent> {
  // Reactive $state properties
  events: T[];
  eosed: boolean;
  error?: Error;
  status: ConnectionStatus;
  refCount: number;

  // Derived getters
  count: number;
  isEmpty: boolean;

  // Filter property
  filters: NDKFilter[];

  // Methods
  start(): void;
  stop(): void;
  restart(): void;
  clear(): void;
  changeFilters(filters: NDKFilter[]): void;
  fetchMore(limit: number): Promise<void>;
  add(event: T): void;
  remove(eventId: string): void;
  ref(): number;
  unref(): number;
}
```

### SubscriptionOptions

```typescript
interface SubscriptionOptions {
  bufferMs?: number | false;
  skipDeleted?: boolean;
  eventClass?: typeof NDKEvent;
  relaySet?: NDKRelaySet;
  autoStart?: boolean;
  onEvent?: (event: NDKEvent, relay?: NDKRelay) => void;
  onEose?: () => void;
}
```

## Troubleshooting

### Reactivity Not Working?

Make sure you're accessing properties in Svelte templates or reactive contexts:

```svelte
<script lang="ts">
const sub = ndk.subscribe({ kinds: [1] });

// ✅ Good - accessed in template, automatically reactive
</script>

{#each sub.events as event}
  <div>{event.content}</div>
{/each}

<!-- ✅ Good - accessed in effect -->
<script lang="ts">
$effect(() => {
  console.log('Events updated:', sub.events.length);
});
</script>
```

### Key Points About Svelte 5 Reactivity

- `$state` variables are reactive, but **you must access them in reactive contexts** for Svelte to track changes
- Simply reading a value in regular JavaScript doesn't create a reactive dependency
- Always access subscription properties in templates, `$effect`, or `$derived` to ensure reactivity
- **Arrays are mutated in place** - The subscription internally uses `.length = 0` and `.push()` to mutate the events array rather than replacing it

## Philosophy & Design Decisions

### Why Runes?

Svelte 5's runes provide fine-grained reactivity that's perfect for real-time data. Instead of stores everywhere, we use reactive classes that feel natural in Svelte 5.

### Why Not Backwards Compatible?

Breaking free from legacy patterns lets us build something truly modern. ndk-svelte5 is designed for new projects and future-looking apps.

### Why Namespaced Stores?

Namespacing stores under the NDK instance prevents global pollution and makes the API clearer. Everything related to NDK is accessible through a single import.

### Why Beautiful APIs?

Code is read more than written. Beautiful, intuitive APIs make building Nostr apps a joy, not a chore.

## Contributing

We're building the best Nostr library for Svelte. Join us!

## License

MIT

## Credits

Built with ❤️ by the Nostr Dev Kit team.
