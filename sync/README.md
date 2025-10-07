# @nostr-dev-kit/sync

NIP-77 Negentropy sync protocol implementation for NDK.

Efficient event synchronization using set reconciliation to minimize bandwidth usage when syncing events between clients and relays.

## Features

- **Bandwidth Efficient**: Uses Negentropy protocol to identify differences without transferring full event data
- **Automatic Fallback**: Falls back to standard `fetchEvents` for relays without NIP-77 support
- **Capability Tracking**: Caches which relays support Negentropy to optimize future syncs
- **Cache Integration**: Automatically populates NDK cache with synced events
- **Sequential Multi-Relay**: Syncs with multiple relays for optimal efficiency
- **Clean API**: Type-safe class-based interface

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

### Recommended: NDKSync Class

The `NDKSync` class provides a clean, stateful API with automatic relay capability tracking:

```typescript
import NDK from '@nostr-dev-kit/ndk';
import { NDKSync } from '@nostr-dev-kit/sync';

const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.damus.io'],
  cacheAdapter: myCacheAdapter  // Required!
});

await ndk.connect();

// Create sync instance (caches relay capabilities)
const sync = new NDKSync(ndk);

// Sync recent notes from a user
const result = await sync.sync({
  kinds: [1],
  authors: [pubkey],
  since: Math.floor(Date.now() / 1000) - 86400  // Last 24h
});

console.log(`Synced ${result.events.length} events`);
console.log(`Needed ${result.need.size} events from relays`);
console.log(`Have ${result.have.size} events relays don't`);
```

### Sync + Subscribe (Recommended)

The `syncAndSubscribe` method combines efficient syncing with live subscriptions, ensuring you don't miss any events during the sync process:

```typescript
import { NDKSync } from '@nostr-dev-kit/sync';

const sync = new NDKSync(ndk);

const sub = await sync.syncAndSubscribe(
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
3. Background: Syncs historical events from each relay
   - Checks capability cache to determine if relay supports Negentropy
   - Uses Negentropy where available (efficient)
   - Falls back to `fetchEvents` for non-Negentropy relays
4. All synced events automatically flow to the subscription

**Perfect for:**
- Wallet syncing (kind 7375, 7376, 5)
- Feed loading
- DM synchronization
- Any scenario where you need complete event coverage

### Static Methods

If you don't need persistent capability tracking, use static methods:

```typescript
import { NDKSync } from '@nostr-dev-kit/sync';

// One-off sync
const result = await NDKSync.sync(ndk, { kinds: [1], limit: 100 });

// One-off sync and subscribe
const sub = await NDKSync.syncAndSubscribe(ndk, { kinds: [1] });
```

### Checking Relay Capabilities

The `NDKSync` class automatically tracks which relays support Negentropy:

```typescript
const sync = new NDKSync(ndk);

// Check if a relay supports Negentropy
const relay = ndk.pool.relays.get("wss://relay.example.com");
const supported = await sync.checkRelaySupport(relay);

// Get all relays that support Negentropy
const negentropyRelays = await sync.getNegentropyRelays();

// Get cached capability info
const capability = sync.getRelayCapability("wss://relay.example.com");
console.log(capability?.supportsNegentropy);
console.log(capability?.lastChecked);

// Clear cache for a specific relay (e.g., after relay update)
sync.clearCapabilityCache("wss://relay.example.com");

// Clear all capability cache
sync.clearCapabilityCache();
```

### Sync Options

```typescript
// Sync with specific relays
const result = await sync.sync(filters, {
  relayUrls: ['wss://relay.nostr.band', 'wss://nos.lol']
});

// Sync without auto-fetch
const result = await sync.sync(filters, {
  autoFetch: false
});

// Manually fetch if needed
if (result.need.size > 100) {
  console.log('Too many to fetch now, schedule for later');
} else {
  await ndk.fetchEvents({ ids: Array.from(result.need) });
}
```

### Background Cache Warming

```typescript
// Good for background sync to populate cache
await sync.sync(filters, {
  autoFetch: true,  // Fetch and cache events
  skipCache: false  // Save to cache (default)
});

// Later, subscriptions will be instant from cache
const sub = ndk.subscribe(filters);
```

## Utility Functions

For checking relay support without creating an `NDKSync` instance:

```typescript
import { supportsNegentropy, getRelayCapabilities, filterNegentropyRelays } from '@nostr-dev-kit/sync';

// Check if a relay supports NIP-77
const supported = await supportsNegentropy("wss://relay.example.com");

// Get detailed relay capabilities
const caps = await getRelayCapabilities("wss://relay.damus.io");
console.log(`Negentropy: ${caps.supportsNegentropy}`);
console.log(`Software: ${caps.software} ${caps.version}`);
console.log(`Supported NIPs: ${caps.supportedNips.join(", ")}`);

// Filter relays to only those with NIP-77 support
const allRelays = ["wss://relay1.com", "wss://relay2.com", "wss://relay3.com"];
const syncRelays = await filterNegentropyRelays(allRelays);
```

## API Reference

### `NDKSync` Class

#### Constructor

```typescript
new NDKSync(ndk: NDK)
```

Creates a new sync instance with relay capability tracking.

#### Methods

##### `sync(filters, options?)`

Performs NIP-77 sync with relays.

**Parameters:**
- `filters`: NDKFilter | NDKFilter[] - Filters to sync
- `options?`: NDKSyncOptions - Sync options

**Returns:** Promise<NDKSyncResult>

##### `syncAndSubscribe(filters, options?)`

Combines sync with live subscription for complete event coverage.

**Parameters:**
- `filters`: NDKFilter | NDKFilter[] - Filters to sync and subscribe
- `options?`: SyncAndSubscribeOptions - Subscription options with sync callbacks

**Returns:** Promise<NDKSubscription>

##### `checkRelaySupport(relay)`

Check if a relay supports Negentropy (uses cache when available).

**Parameters:**
- `relay`: NDKRelay - Relay to check

**Returns:** Promise<boolean>

##### `getNegentropyRelays(relays?)`

Get all relays that support Negentropy.

**Parameters:**
- `relays?`: NDKRelay[] - Optional specific relays to check (defaults to all NDK relays)

**Returns:** Promise<NDKRelay[]>

##### `getRelayCapability(relayUrl)`

Get cached capability info for a relay.

**Parameters:**
- `relayUrl`: string - Relay URL

**Returns:** RelayCapability | undefined

##### `clearCapabilityCache(relayUrl?)`

Clear capability cache.

**Parameters:**
- `relayUrl?`: string - Optional specific relay URL (clears all if omitted)

#### Static Methods

##### `NDKSync.sync(ndk, filters, options?)`

Static convenience method for one-off syncs.

##### `NDKSync.syncAndSubscribe(ndk, filters, options?)`

Static convenience method for one-off sync+subscribe.

### Types

#### `NDKSyncOptions`

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

#### `NDKSyncResult`

```typescript
interface NDKSyncResult {
  events: NDKEvent[];             // Fetched events (if autoFetch: true)
  need: Set<NDKEventId>;          // Event IDs we needed
  have: Set<NDKEventId>;          // Event IDs we have
}
```

#### `SyncAndSubscribeOptions`

```typescript
interface SyncAndSubscribeOptions extends NDKSubscriptionOptions {
  onRelaySynced?: (relay: NDKRelay, eventCount: number) => void;
  onSyncComplete?: () => void;
  relaySet?: NDKRelaySet;
  relayUrls?: string[];
}
```

#### `RelayCapability`

```typescript
interface RelayCapability {
  supportsNegentropy: boolean;
  lastChecked: number;
  lastError?: string;
}
```

## How It Works

1. **Cache Query**: Queries NDK cache for events matching filters
2. **Storage Build**: Builds Negentropy storage from cached events
3. **Capability Check**: Checks if relay supports NIP-77 (cached for 1 hour)
4. **Sync Session**: For Negentropy relays, exchanges compact messages to identify differences
5. **Fallback**: For non-Negentropy relays, uses standard `fetchEvents`
6. **Event Fetch**: Automatically fetches missing events (if autoFetch: true)
7. **Cache Update**: Saves fetched events to cache for future use

### Sequential Multi-Relay Sync

When syncing with multiple relays:

```typescript
const result = await sync.sync(filters, {
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
  const result = await sync.sync(filters);
} catch (error) {
  if (error.message.includes('cache adapter')) {
    console.error('Sync requires a cache adapter');
  } else {
    console.error('Sync failed:', error);
  }
}
```

Note: Relays without NIP-77 support automatically fall back to `fetchEvents` - no error is thrown.

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

### Low-Level Functions

For advanced usage without the `NDKSync` class:

```typescript
import { ndkSync, syncAndSubscribe } from '@nostr-dev-kit/sync';

// Direct function calls
const result = await ndkSync.call(ndk, filters, options);
const sub = await syncAndSubscribe.call(ndk, filters, options);
```

## Protocol Details

This package implements [NIP-77](https://nips.nostr.com/77) - Negentropy Protocol for set reconciliation.

**Key Features:**
- Uses range-based set reconciliation
- XOR-based fingerprinting for efficient comparison
- Variable-length encoding for compact messages
- Frame size limiting to prevent oversized messages
- Automatic fallback to standard REQ/EVENT for non-supporting relays

## Performance

Negentropy is extremely bandwidth-efficient when relays support it:

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
- Show progress for each relay (Negentropy vs fallback)
- Display live events as they arrive in real-time
- Keep running to demonstrate live subscription

**Note on Testing**: Most Nostr relays don't support NIP-77 yet, so the basic E2E test will timeout. The syncAndSubscribe E2E test works with any relay (falls back to fetchEvents). See [TESTING.md](./TESTING.md) for details on testing approaches and relay compatibility.

## License

MIT

## Credits

Based on the [Negentropy protocol](https://github.com/hoytech/negentropy) by Doug Hoyte, implementing the range-based set reconciliation algorithm by Aljoscha Meyer.
