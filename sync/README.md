# @nostr-dev-kit/sync

NIP-77 Negentropy sync protocol implementation for NDK.

Efficient event synchronization using set reconciliation to minimize bandwidth usage when syncing events between clients and relays.

## Features

- **Bandwidth Efficient**: Uses Negentropy protocol to identify differences without transferring full event data
- **Cache Integration**: Automatically populates NDK cache with synced events
- **Sequential Multi-Relay**: Syncs with multiple relays sequentially for optimal efficiency
- **Flexible API**: Simple `await ndk.sync(filters)` interface
- **Auto-Fetch**: Optionally fetches missing events automatically

## Installation

```bash
npm install @nostr-dev-kit/sync
# or
bun add @nostr-dev-kit/sync
```

## Requirements

- `@nostr-dev-kit/ndk` (workspace dependency)
- An NDK cache adapter must be configured

## Usage

### Basic Sync

```typescript
import NDK from '@nostr-dev-kit/ndk';
import { ndkSync } from '@nostr-dev-kit/sync';

const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.damus.io'],
  cacheAdapter: myCacheAdapter  // Required!
});

await ndk.connect();

// Sync recent notes from a user
const result = await ndkSync.call(ndk, {
  kinds: [1],
  authors: [pubkey],
  since: Math.floor(Date.now() / 1000) - 86400  // Last 24h
});

console.log(`Synced ${result.events.length} events`);
console.log(`Needed ${result.need.size} events from relays`);
console.log(`Have ${result.have.size} events relays don't`);
```

Alternatively, you can attach it to NDK's prototype:

```typescript
import NDK from '@nostr-dev-kit/ndk';
import { ndkSync } from '@nostr-dev-kit/sync';

// Attach to prototype (once, at app startup)
NDK.prototype.sync = ndkSync;

// Now use as a method
const ndk = new NDK({ ... });
const result = await ndk.sync(filters);
```

### Sync Without Auto-Fetch

```typescript
const result = await ndk.sync(filters, {
  autoFetch: false
});

// Manually decide what to fetch
if (result.need.size > 100) {
  console.log('Too many to fetch now, schedule for later');
} else {
  await ndk.fetchEvents({ ids: Array.from(result.need) });
}
```

### Sync With Specific Relays

```typescript
const result = await ndk.sync(filters, {
  relayUrls: ['wss://relay.nostr.band', 'wss://nos.lol']
});
```

### Background Cache Warming

```typescript
// Good for background sync to populate cache
await ndk.sync(filters, {
  autoFetch: true,  // Fetch and cache events
  skipCache: false  // Save to cache (default)
});

// Later, subscriptions will be instant from cache
const sub = ndk.subscribe(filters);
```

### Sync + Subscribe (Recommended)

The `syncAndSubscribe` function combines efficient syncing with live subscriptions, ensuring you don't miss any events during the sync process:

```typescript
import { syncAndSubscribe } from '@nostr-dev-kit/sync';

const sub = await syncAndSubscribe.call(ndk,
  { kinds: [1], authors: [pubkey] },
  {
    onEvent: (event) => {
      console.log('Event:', event.content);
    },
    onRelaySynced: (relay, count) => {
      console.log(`✓ Synced ${count} events from ${relay.url}`);
    },
    onSyncComplete: () => {
      console.log('✓ All relays synced!');
    }
  }
);

// Subscription is already receiving events
// Background sync continues for historical events
```

**How it works:**
1. Immediately starts a subscription with `limit: 0` to catch new events
2. Returns the subscription right away (non-blocking)
3. Background: Syncs historical events from each relay sequentially
   - Uses Negentropy where available
   - Falls back to `fetchEvents` for non-Negentropy relays
4. All synced events automatically flow to the subscription

**Perfect for:**
- Wallet syncing (kind 7375, 7376, 5)
- Feed loading
- DM synchronization
- Any scenario where you need complete event coverage

## Checking Relay Support

Most relays don't support NIP-77 yet. Check before syncing:

### Check if a relay supports NIP-77

```typescript
import { supportsNegentropy } from '@nostr-dev-kit/sync';

const relay = ndk.pool.relays.get("wss://relay.example.com");
const supported = await supportsNegentropy(relay);

if (supported) {
  const result = await ndk.sync(filters);
} else {
  console.log("Relay doesn't support NIP-77");
}
```

### Filter relays to only those with NIP-77 support

```typescript
import { filterNegentropyRelays } from '@nostr-dev-kit/sync';

const allRelays = ["wss://relay1.com", "wss://relay2.com", "wss://relay3.com"];
const syncRelays = await filterNegentropyRelays(allRelays);

if (syncRelays.length > 0) {
  const result = await ndk.sync(filters, { relayUrls: syncRelays });
} else {
  console.log("No relays support NIP-77");
}
```

### Get detailed relay capabilities

```typescript
import { getRelayCapabilities } from '@nostr-dev-kit/sync';

const caps = await getRelayCapabilities("wss://relay.damus.io");
console.log(`Negentropy: ${caps.supportsNegentropy}`);
console.log(`Software: ${caps.software} ${caps.version}`);
console.log(`Supported NIPs: ${caps.supportedNips.join(", ")}`);
```

## API

### `ndk.sync(filters, options?)`

Performs NIP-77 sync with relays.

**Parameters:**
- `filters`: NDKFilter | NDKFilter[] - Filters to sync
- `options?`: NDKSyncOptions - Sync options

**Returns:** Promise<NDKSyncResult>

### NDKSyncOptions

```typescript
interface NDKSyncOptions {
  // Relay selection
  relaySet?: NDKRelaySet;        // Explicit relay set
  relayUrls?: string[];           // Or explicit relay URLs

  // Behavior
  autoFetch?: boolean;            // Auto-fetch events (default: true)
  frameSizeLimit?: number;        // Message size limit (default: 50000)
  skipCache?: boolean;            // Don't save to cache (default: false)
}
```

### NDKSyncResult

```typescript
interface NDKSyncResult {
  events: NDKEvent[];             // Fetched events (if autoFetch: true)
  need: Set<NDKEventId>;          // Event IDs we needed
  have: Set<NDKEventId>;          // Event IDs we have
}
```

### Relay Capability Functions

#### `supportsNegentropy(relay)`

Check if a relay supports NIP-77.

**Parameters:**
- `relay`: NDKRelay | string - Relay instance or URL

**Returns:** Promise<boolean>

**Example:**
```typescript
const supported = await supportsNegentropy("wss://relay.example.com");
```

#### `filterNegentropyRelays(relays)`

Filter an array of relays to only those supporting NIP-77.

**Parameters:**
- `relays`: (NDKRelay | string)[] - Array of relays or URLs

**Returns:** Promise<string[]> - Array of relay URLs that support NIP-77

**Example:**
```typescript
const syncRelays = await filterNegentropyRelays([
  "wss://relay1.com",
  "wss://relay2.com"
]);
```

#### `getRelayCapabilities(relay)`

Get detailed relay information including NIP-77 support.

**Parameters:**
- `relay`: NDKRelay | string - Relay instance or URL

**Returns:** Promise<RelayCapabilities>

**Example:**
```typescript
const caps = await getRelayCapabilities("wss://relay.damus.io");
console.log(caps.supportsNegentropy); // boolean
console.log(caps.supportedNips);      // number[]
console.log(caps.software);           // string | undefined
```

#### `fetchRelayInformation(relayUrl)`

Fetch the raw NIP-11 relay information document.

**Parameters:**
- `relayUrl`: string - WebSocket URL of the relay

**Returns:** Promise<RelayInformation> - NIP-11 document

**Example:**
```typescript
const info = await fetchRelayInformation("wss://relay.damus.io");
console.log(info.name);
console.log(info.supported_nips);
```

## How It Works

1. **Cache Query**: Queries NDK cache for events matching filters
2. **Storage Build**: Builds Negentropy storage from cached events
3. **Sync Session**: Exchanges compact messages with relay to identify differences
4. **Event Fetch**: Automatically fetches missing events (if autoFetch: true)
5. **Cache Update**: Saves fetched events to cache for future use

### Sequential Multi-Relay Sync

When syncing with multiple relays:

```typescript
const result = await ndk.sync(filters, {
  relayUrls: ['wss://relay1.com', 'wss://relay2.com']
});
```

1. Sync with relay1, fetch events, cache them
2. Sync with relay2 (now includes relay1's events in storage)
3. Fetch any new events from relay2, cache them
4. Return merged results

This approach is bandwidth-efficient: later relays see events from earlier relays and won't re-request them.

## Error Handling

```typescript
try {
  const result = await ndk.sync(filters);
} catch (error) {
  if (error.message.includes('cache adapter')) {
    console.error('Sync requires a cache adapter');
  } else if (error.message.includes('negentropy')) {
    console.error('Relay doesn't support NIP-77');
  } else {
    console.error('Sync failed:', error);
  }
}
```

## Advanced Usage

### Manual Negentropy

For advanced use cases, you can use the Negentropy classes directly:

```typescript
import { Negentropy, NegentropyStorage } from '@nostr-dev-kit/sync';

// Build storage from events
const storage = NegentropyStorage.fromEvents(events);

// Create negentropy instance
const neg = new Negentropy(storage, 50000);

// Generate initial message
const initialMsg = await neg.initiate();

// Process responses
const { nextMessage, have, need } = await neg.reconcile(response);
```

## Protocol Details

This package implements [NIP-77](https://nips.nostr.com/77) - Negentropy Protocol for set reconciliation.

**Key Features:**
- Uses range-based set reconciliation
- XOR-based fingerprinting for efficient comparison
- Variable-length encoding for compact messages
- Frame size limiting to prevent oversized messages

## Performance

Negentropy is extremely bandwidth-efficient:

- **Small differences**: ~1-2 KB of messages to sync 1000s of events
- **Large differences**: Scales logarithmically with set size
- **No differences**: Single round-trip with ~100 bytes

Compared to traditional REQ/EVENT syncing, Negentropy can reduce bandwidth by 10-100x when sets are mostly synchronized.

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Watch mode
bun run dev

# E2E Test (requires NIP-77 compatible relay)
bun run e2e

# E2E test for syncAndSubscribe
bun run e2e:sync-subscribe <npub or hex pubkey>

# Lint
bun run lint
```

### E2E Examples

**Test syncAndSubscribe pattern:**
```bash
# Using your own pubkey
bun run e2e:sync-subscribe npub1...

# Or with hex pubkey
bun run e2e:sync-subscribe 3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d
```

This will:
- Connect to multiple relays
- Start a live subscription immediately (non-blocking)
- Sync historical events in the background
- Show progress for each relay
- Display live events as they arrive in real-time
- Keep running to demonstrate live subscription

**Note on Testing**: Most Nostr relays don't support NIP-77 yet, so the basic E2E test will timeout. The syncAndSubscribe E2E test works with any relay (falls back to fetchEvents). See [TESTING.md](./TESTING.md) for details on testing approaches and relay compatibility.

## License

MIT

## Credits

Based on the [Negentropy protocol](https://github.com/hoytech/negentropy) by Doug Hoyte, implementing the range-based set reconciliation algorithm by Aljoscha Meyer.
