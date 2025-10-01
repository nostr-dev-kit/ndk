# @nostr-dev-kit/ndk-svelte5

> Modern, performant, and beautiful Svelte 5 integration for NDK

A ground-up reimagining of NDK for Svelte 5, built with runes, designed for beauty and performance.

## Philosophy

ndk-svelte5 embraces **Svelte 5's reactive primitives** to create a library that feels native, performs beautifully, and makes building Nostr apps a joy.

- **Runes-first**: Reactive classes using `$state`, `$derived`, and `$effect`
- **Global stores**: For shared state (profiles, sessions, mutes)
- **Zero compromises**: No backwards compatibility, pure Svelte 5
- **Performance-focused**: Buffered updates, smart deduplication
- **TypeScript-native**: Full type safety and inference
- **Aesthetic APIs**: Beautiful code that reads like poetry

## Status

**Current Version**: 0.1.0
**Status**: Beta - Core features implemented and tested

### ✅ Implemented Features

- **Core Subscriptions**: Reactive EventSubscription with automatic cleanup
- **Global Stores**: Profiles, sessions, mutes, and wallet
- **Advanced Features**: ReactiveEvent and ReactiveFilter classes
- **Wallet Integration**: Full support for Cashu, NWC, and WebLN wallets
- **Nutzap Monitoring**: Automatic nutzap detection and redemption
- **Test Coverage**: 119 tests passing across all core functionality

### 🚧 Coming Soon

- Component library (UserAvatar, UserName, etc.)
- Additional examples
- Performance optimizations
- Documentation site

## Installation

```bash
pnpm add @nostr-dev-kit/ndk-svelte5
```

## Core Concepts

### 1. Reactive Subscriptions

The heart of ndk-svelte5 is the `EventSubscription` class - a reactive, self-managing subscription.

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';
import { NDKKind } from '@nostr-dev-kit/ndk';

// Create a reactive subscription
const notes = ndk.subscribeReactive([{ kinds: [NDKKind.Text], limit: 50 }]);

// Access reactive state directly
$inspect(notes.events); // Array of events
$inspect(notes.eosed);  // EOSE flag
$inspect(notes.count);  // Event count
</script>

{#each notes.events as note}
  <article>{note.content}</article>
{/each}

{#if notes.isEmpty}
  <span>No notes yet</span>
{/if}
```

**Automatic cleanup**: The subscription stops when the component unmounts. No manual cleanup needed.

### 2. Reactive Event Classes

Events become reactive objects with `$state` properties:

```svelte
<script lang="ts">
import { ReactiveEvent } from '@nostr-dev-kit/ndk-svelte5';

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

### 3. Global Stores

For shared state across your app, ndk-svelte5 provides global stores using Svelte's `$state` API:

```svelte
<script lang="ts">
import { profiles, sessions, mutes } from '@nostr-dev-kit/ndk-svelte5/stores';

// Profile store - automatically fetches and caches profiles
const profile = profiles.get(pubkey);

// Session management
const currentUser = sessions.current;
sessions.login(signer);
sessions.logout();

// Mute management
mutes.add({ pubkey: 'hex...' });
const isMuted = mutes.check({ pubkey });
</script>

<img src={profile?.image} alt={profile?.name} />
```

## Subscription API

### Basic Usage

```svelte
<script lang="ts">
import { ndk } from '$lib/ndk';

const sub = ndk.subscribe([
  { kinds: [1], authors: [pubkey], limit: 100 }
]);

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
  [{ kinds: [9802], limit: 50 }],
  {
    // Buffer events for performance (default: 30ms)
    bufferMs: 30,

    // Filter deleted events automatically
    skipDeleted: true,

    // Filter muted content
    skipMuted: true,

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

### Advanced: Reposts

Automatically fetch reposted events:

```svelte
<script lang="ts">
const highlights = ndk.subscribe(
  [{ kinds: [9802], '#t': ['nostr'] }],
  {
    // Also fetch reposts (kind 16)
    reposts: {
      filters: [{ kinds: [16], '#k': ['9802'], '#t': ['nostr'] }],
      // Reposts will be automatically resolved and merged
    }
  }
);

// Access repost information
{#each highlights.events as highlight}
  {#if highlight.reposts?.length}
    Reposted by {highlight.reposts.length} users
  {/if}
{/each}
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

## Profile Store

The profile store automatically fetches, caches, and keeps profiles up-to-date:

```svelte
<script lang="ts">
import { profiles } from '@nostr-dev-kit/ndk-svelte5/stores';

// Get a profile (fetches if not cached)
const profile = profiles.get(pubkey);

// Profile is reactive - updates automatically
$inspect(profile); // { name, image, about, ... }

// Batch fetch multiple profiles
await profiles.fetch([pubkey1, pubkey2, pubkey3]);

// Update current user's profile
await profiles.update({
  name: 'New Name',
  image: 'https://...',
  about: 'Bio',
});

// Listen to profile updates
$effect(() => {
  if (profile) {
    console.log('Profile updated:', profile.name);
  }
});
</script>
```

### Profile Components

```svelte
<script lang="ts">
import { UserProfile, UserAvatar, UserName } from '@nostr-dev-kit/ndk-svelte5/components';
</script>

<!-- Automatic profile fetching and rendering -->
<UserAvatar {pubkey} size="lg" />
<UserName {pubkey} />
<UserProfile {pubkey} />
```

## Session Management

Built-in multi-user session support:

```svelte
<script lang="ts">
import { sessions } from '@nostr-dev-kit/ndk-svelte5/stores';

// Current session (reactive)
const current = sessions.current;
$inspect(current?.pubkey);
$inspect(current?.profile);

// Reactive accessors for current session data
$inspect(sessions.follows);  // Set<string> - followed pubkeys
$inspect(sessions.mutes);    // Set<string> - muted pubkeys
$inspect(sessions.profile);  // NDKUserProfile | undefined

// Get session events by kind
const contactList = sessions.getSessionEvent(3);      // Kind 3: Contacts
const muteList = sessions.getSessionEvent(10000);     // Kind 10000: Mutes
const relayList = sessions.getSessionEvent(10002);    // Kind 10002: Relays

// Login with NIP-07, NIP-46, or NIP-55
await sessions.login(signer);

// Add multiple accounts
await sessions.add(signer2);

// Switch between accounts
sessions.switch(pubkey);

// Logout
sessions.logout(pubkey); // specific user
sessions.logoutAll();    // all users

// All sessions
$inspect(sessions.all); // Session[]
</script>

<!-- UI Example -->
{#if current}
  <UserProfile pubkey={current.pubkey} />
  <p>Following {sessions.follows.size} accounts</p>
  <button onclick={() => sessions.logout()}>Logout</button>
{:else}
  <button onclick={handleLogin}>Login</button>
{/if}

<!-- Account switcher -->
<select onchange={(e) => sessions.switch(e.target.value)}>
  {#each sessions.all as session}
    <option value={session.pubkey}>{session.profile?.name}</option>
  {/each}
</select>
```

### Session State

Each session includes:

```typescript
interface Session {
  pubkey: string;
  signer: NDKSigner;
  profile?: NDKUserProfile;
  follows: Set<string>;     // Following list
  mutes: Set<string>;       // Muted users
  relays: NDKRelaySet;      // User's relays
  events: Map<number, NDKEvent>; // Cached replaceable events
}
```

### Session Store API

The session store provides convenient reactive accessors for current session data:

```typescript
// Reactive getters (return data for current session)
sessions.current    // Session | undefined
sessions.all        // Session[]
sessions.follows    // Set<string> - empty Set if no session
sessions.mutes      // Set<string> - empty Set if no session
sessions.profile    // NDKUserProfile | undefined

// Methods
sessions.login(signer)           // Login and set as active
sessions.add(signer)             // Add without switching
sessions.switch(pubkey)          // Switch active session
sessions.logout(pubkey?)         // Logout (current or specific)
sessions.logoutAll()             // Clear all sessions
sessions.get(pubkey)             // Get specific session
sessions.getSessionEvent(kind)   // Get event by kind for current session
```

## Mute Management

Powerful muting with automatic filtering:

```svelte
<script lang="ts">
import { mutes } from '@nostr-dev-kit/ndk-svelte5/stores';

// Check if muted
const isMuted = mutes.check({ pubkey });
const isWordMuted = mutes.check({ content: 'badword' });
const isTagMuted = mutes.check({ hashtag: 'spam' });

// Add mutes
mutes.add({ pubkey: 'hex...' });
mutes.add({ word: 'spam' });
mutes.add({ hashtag: 'scam' });
mutes.add({ eventId: 'hex...' });

// Remove mutes
mutes.remove({ pubkey: 'hex...' });

// Clear all mutes
mutes.clear();

// Automatically publish mute list (NIP-51)
mutes.publish();

// All muted items (reactive)
$inspect(mutes.pubkeys);   // Set<string>
$inspect(mutes.words);     // Set<string>
$inspect(mutes.hashtags);  // Set<string>
$inspect(mutes.eventIds);  // Set<string>
</script>

<!-- Subscriptions automatically filter muted content -->
<script lang="ts">
const notes = ndk.subscribe([{ kinds: [1] }], {
  skipMuted: true // Default behavior
});
</script>
```

## Wallet Integration

Seamless integration with ndk-wallet:

```svelte
<script lang="ts">
import { wallet } from '@nostr-dev-kit/ndk-svelte5/wallet';
import { NDKCashuWallet } from '@nostr-dev-kit/ndk-wallet';

// Create wallet
const cashuWallet = new NDKCashuWallet(ndk);
wallet.set(cashuWallet);

// Reactive wallet state
$inspect(wallet.balance);        // number
$inspect(wallet.balanceByMint);  // Map<string, number>
$inspect(wallet.connected);      // boolean
$inspect(wallet.type);           // 'cashu' | 'nwc' | 'webln'

// Send payment
const result = await wallet.pay({
  amount: 1000,
  recipient: pubkey,
  comment: 'Thanks!',
});

// Receive nutzaps
const monitor = wallet.nutzaps.monitor();
$inspect(monitor.pending);   // Nutzap[]
$inspect(monitor.redeemed);  // Nutzap[]

// Wallet history
$inspect(wallet.history); // Transaction[]
</script>

<!-- Wallet UI Components -->
<script lang="ts">
import { WalletBalance, WalletHistory, PaymentButton } from '@nostr-dev-kit/ndk-svelte5/wallet';
</script>

<WalletBalance />
<WalletHistory limit={10} />
<PaymentButton {amount} {recipient} />
```

## Advanced Patterns

### Derived Subscriptions

Create derived reactive state from subscriptions:

```svelte
<script lang="ts">
const notes = ndk.subscribe([{ kinds: [1], authors: [pubkey] }]);

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

const hasMedia = $derived(
  notes.events.some(n => n.content.includes('https://'))
);
</script>
```

### Reactive Filters

Build dynamic filters that automatically update subscriptions:

```svelte
<script lang="ts">
import { ReactiveFilter } from '@nostr-dev-kit/ndk-svelte5';

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
const notes = ndk.subscribe([{ kinds: [1] }]);

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

### Pagination

Built-in pagination support:

```svelte
<script lang="ts">
import { InfiniteScroll } from '@nostr-dev-kit/ndk-svelte5/components';

const notes = ndk.subscribe([{ kinds: [1], limit: 20 }]);

async function loadMore() {
  await notes.fetchMore(20); // Fetch 20 more
}
</script>

<InfiniteScroll on:loadmore={loadMore}>
  {#each notes.events as note}
    <EventCard {note} />
  {/each}
</InfiniteScroll>
```

### Proper Use of EOSE

The `eosed` flag is for **performance optimization and analytics**, not loading states:

```svelte
<script lang="ts">
const notes = ndk.subscribe([{ kinds: [1] }]);

// ✅ Good: Trigger pagination after initial load
$effect(() => {
  if (notes.eosed && notes.count < 10) {
    notes.fetchMore(20);
  }
});

// ✅ Good: Performance analytics
$effect(() => {
  if (notes.eosed) {
    console.log(`Loaded ${notes.count} events from ${relay.url}`);
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

### Reference Counting

Share subscriptions across components for performance:

```ts
// lib/stores/highlights.ts
import { ndk } from '$lib/ndk';

export const highlightsSubscription = ndk.subscribe(
  [{ kinds: [9802], limit: 100 }],
  { autoStart: false }
);
```

```svelte
<!-- Component A -->
<script lang="ts">
import { highlightsSubscription } from '$lib/stores/highlights';
import { onMount, onDestroy } from 'svelte';

onMount(() => highlightsSubscription.ref());
onDestroy(() => highlightsSubscription.unref());
</script>

<!-- Component B -->
<script lang="ts">
import { highlightsSubscription } from '$lib/stores/highlights';
import { onMount, onDestroy } from 'svelte';

onMount(() => highlightsSubscription.ref());
onDestroy(() => highlightsSubscription.unref());
</script>
```

Both components share the same subscription. It starts when the first mounts, stops when the last unmounts.

## Performance

### Buffered Updates

By default, events are buffered for 30ms to batch DOM updates:

```svelte
<script lang="ts">
// High-frequency updates (default)
const sub1 = ndk.subscribe([filters], {
  bufferMs: 30 // Batch updates every 30ms
});

// Real-time updates (no buffering)
const sub2 = ndk.subscribe([filters], {
  bufferMs: false // Update immediately
});

// After EOSE, buffering automatically reduces to 16ms (~60fps)
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

### Virtual Lists

For large lists, use virtual scrolling:

```svelte
<script lang="ts">
import { VirtualList } from '@nostr-dev-kit/ndk-svelte5/components';

const notes = ndk.subscribe([{ kinds: [1], limit: 1000 }]);
</script>

<VirtualList items={notes.events} let:item>
  <EventCard event={item} />
</VirtualList>
```

## Type Safety

Full TypeScript support with smart type inference:

```typescript
import { ndk } from '$lib/ndk';
import { NDKHighlight } from '@nostr-dev-kit/ndk';

// Type is inferred as EventSubscription<NDKHighlight>
const highlights = ndk.subscribe<NDKHighlight>(
  [{ kinds: [9802] }],
  { eventClass: NDKHighlight }
);

// highlights.events is NDKHighlight[]
highlights.events[0].highlightedContent; // Type-safe

// Custom event types
class CustomEvent extends NDKEvent {
  get specialProperty() {
    return this.tagValue('special');
  }
}

const custom = ndk.subscribe<CustomEvent>(
  [{ kinds: [30000] }],
  { eventClass: CustomEvent }
);

// custom.events[0].specialProperty is accessible
```

## Migration from ndk-svelte

```svelte
<!-- Old (ndk-svelte) -->
<script lang="ts">
import { onDestroy } from 'svelte';

const store = $ndk.storeSubscribe([{ kinds: [1] }]);

onDestroy(() => {
  store.unsubscribe();
});
</script>

{#each $store as event}
  {event.content}
{/each}

<!-- New (ndk-svelte5) -->
<script lang="ts">
const sub = ndk.subscribe([{ kinds: [1] }]);
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
├── subscribe() → EventSubscription<T>
├── profiles → ProfileStore
├── sessions → SessionStore
├── mutes → MuteStore
└── wallet → WalletStore

EventSubscription<T>
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

### Store Architecture

```
stores/
├── profiles.svelte.ts    - Global profile cache
├── sessions.svelte.ts    - Multi-user session management
├── mutes.svelte.ts       - Mute management
└── wallet.svelte.ts      - Wallet state
```

## Examples

See the [examples](./examples) directory for complete working examples:

- [Basic Feed](./examples/basic-feed) - Simple note feed with profiles ✅

### Coming Soon

- Multi-user App - Account switching and management
- Wallet Integration - Payment flows and nutzap monitoring
- Real-time Chat - Messaging with DMs
- Advanced Patterns - Complex reactive patterns

## API Reference

### NDKSvelte

```typescript
class NDKSvelte extends NDK {
  subscribe<T extends NDKEvent>(
    filters: NDKFilter | NDKFilter[],
    opts?: SubscriptionOptions
  ): EventSubscription<T>;
}
```

### EventSubscription

```typescript
class EventSubscription<T extends NDKEvent> {
  // Reactive state
  events: T[];
  eosed: boolean;
  count: number; // derived
  isEmpty: boolean; // derived

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
  skipMuted?: boolean;
  eventClass?: typeof NDKEvent;
  relaySet?: NDKRelaySet;
  autoStart?: boolean;
  reposts?: {
    filters: NDKFilter[];
  };
  onEvent?: (event: NDKEvent, relay?: NDKRelay) => void;
  onEose?: () => void;
}
```

## Philosophy & Design Decisions

### Why Runes?

Svelte 5's runes provide fine-grained reactivity that's perfect for real-time data. Instead of stores everywhere, we use reactive classes that feel natural in Svelte 5.

### Why Not Backwards Compatible?

Breaking free from legacy patterns lets us build something truly modern. ndk-svelte5 is designed for new projects and future-looking apps.

### Why Global Stores?

Some state (profiles, sessions, mutes) is truly global. Svelte 5 still recommends stores for shared state - we use them where appropriate.

### Why Beautiful APIs?

Code is read more than written. Beautiful, intuitive APIs make building Nostr apps a joy, not a chore.

## Contributing

We're building the best Nostr library for Svelte. Join us!

## License

MIT

## Credits

Built with ❤️ by the Nostr Dev Kit team.
