# Sync & Negentropy

The `@nostr-dev-kit/sync` package provides efficient event synchronization using the [NIP-77 Negentropy protocol](https://nips.nostr.com/77). Instead of fetching all events, negentropy uses set reconciliation to identify and transfer only the differences between your local cache and relay data.

## Key Benefits

- **10-100x Bandwidth Reduction**: Only sync what you don't have
- **Cache Integration**: Automatically works with NDK cache adapters
- **Simple API**: `await ndk.sync(filters)` 
- **Multi-Relay Support**: Sequential sync across multiple relays with deduplication
- **Live Updates**: `syncAndSubscribe` pattern for historical + real-time events

## Installation

```bash
npm install @nostr-dev-kit/sync
# or
bun add @nostr-dev-kit/sync
```

## Quick Start

```typescript
import NDK from '@nostr-dev-kit/ndk';
import { ndkSync } from '@nostr-dev-kit/sync';

const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.damus.io'],
  cacheAdapter: myCacheAdapter  // Required!
});

await ndk.connect();

// Sync recent notes
const result = await ndkSync.call(ndk, {
  kinds: [1],
  authors: [pubkey],
  since: Math.floor(Date.now() / 1000) - 86400
});

console.log(`Synced ${result.events.length} events`);
```

## Core Features

### Basic Sync

The simplest way to sync events:

```typescript
const result = await ndkSync.call(ndk, filters);
```

**Returns:**
- `events`: Array of fetched events (if `autoFetch: true`)
- `need`: Set of event IDs we needed from relays
- `have`: Set of event IDs we already had

### Sync + Subscribe Pattern

For seamless historical + live event coverage:

```typescript
import { syncAndSubscribe } from '@nostr-dev-kit/sync';

const sub = await syncAndSubscribe.call(ndk,
  { kinds: [1], authors: [pubkey] },
  {
    onEvent: (event) => console.log('Event:', event.content),
    onRelaySynced: (relay, count) => console.log(`Synced ${count} from ${relay.url}`),
    onSyncComplete: () => console.log('All relays synced!')
  }
);
```

**How it works:**
1. Immediately starts subscription (non-blocking)
2. Background: syncs historical events from each relay
3. All events flow to the same subscription
4. Perfect for wallets, feeds, DMs

### Relay Capability Detection

Check if relays support NIP-77 before syncing:

```typescript
import { supportsNegentropy, filterNegentropyRelays } from '@nostr-dev-kit/sync';

// Check single relay
const supported = await supportsNegentropy('wss://relay.damus.io');

// Filter relay list
const allRelays = ['wss://relay1.com', 'wss://relay2.com'];
const syncRelays = await filterNegentropyRelays(allRelays);
```

## Options

### NDKSyncOptions

```typescript
interface NDKSyncOptions {
  // Relay selection
  relaySet?: NDKRelaySet;      // Explicit relay set
  relayUrls?: string[];         // Or relay URLs
  
  // Behavior
  autoFetch?: boolean;          // Auto-fetch events (default: true)
  frameSizeLimit?: number;      // Message size limit (default: 50000)
  skipCache?: boolean;          // Don't save to cache (default: false)
}
```

## Advanced Usage

### Manual Negentropy

For custom use cases:

```typescript
import { Negentropy, NegentropyStorage } from '@nostr-dev-kit/sync';

const storage = NegentropyStorage.fromEvents(events);
const neg = new Negentropy(storage, 50000);

const initialMsg = await neg.initiate();
const { nextMessage, have, need } = await neg.reconcile(response);
```

## Performance

Negentropy is extremely bandwidth-efficient:

- **Small differences**: ~1-2 KB to sync 1000s of events
- **Large differences**: Scales logarithmically
- **No differences**: Single round-trip (~100 bytes)

## Relay Compatibility

Most relays don't support NIP-77 yet. Known compatible relays:
- wss://relay.damus.io (strfry)
- wss://nos.lol (strfry)
- wss://relay.snort.social (strfry)

Always check relay support before syncing!

## Examples

See the [package README](https://github.com/nostr-dev-kit/ndk/blob/master/sync/README.md) for more examples and the [check-relay-support example](https://github.com/nostr-dev-kit/ndk/blob/master/sync/examples/check-relay-support.ts) for relay capability checking.
