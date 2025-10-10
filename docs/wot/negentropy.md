# Negentropy Integration in ndk-wot

## Overview

The ndk-wot package now supports efficient batch syncing of contact lists using NIP-77 Negentropy protocol. This significantly reduces bandwidth when building large Web of Trust graphs.

## How It Works

### Smart Fetch Strategy

The implementation uses different fetch strategies based on batch size:

1. **Small Batches (< threshold)**: Uses regular subscription-based fetch
   - Fetching fewer than `negentropyMinAuthors` contact lists (default: 5)
   - Subscription is faster for small batches
   - No overhead from negentropy protocol

2. **Large Batches (>= threshold)**: Attempts to use negentropy
   - Fetching `negentropyMinAuthors` or more contact lists
   - Negentropy provides significant bandwidth savings
   - Automatically detects negentropy-compatible relays
   - Gracefully falls back to subscription if negentropy unavailable

### Key Features

- **Automatic Relay Detection**: Checks which connected relays support NIP-77
- **Graceful Fallback**: Falls back to subscription-based fetching if:
  - No negentropy-compatible relays found
  - Negentropy sync fails
  - Cache adapter not provided
- **Efficient Reconciliation**: Recognizes events already in cache vs. events to fetch
- **Debug Logging**: Detailed logs available via `DEBUG=ndk-wot` environment variable

## Usage

```typescript
import NDK from "@nostr-dev-kit/ndk";
import { NDKWoT } from "@nostr-dev-kit/wot";

// Create NDK instance with cache adapter (required for negentropy)
const ndk = new NDK({
    explicitRelayUrls: ["wss://relay.damus.io"],
    cacheAdapter: yourCacheAdapter, // Required for negentropy
});

await ndk.connect();

// Create WoT instance
const wot = new NDKWoT(ndk, rootUserPubkey);

// Load with negentropy enabled (default)
await wot.load({
    depth: 2,
    maxFollows: 100,
    useNegentropy: true, // Enable negentropy (default)
    negentropyMinAuthors: 5, // Use negentropy when fetching 5+ authors (default)
    relayUrls: ["wss://relay.damus.io"], // Optional: specific relays
});

// Use lower threshold for more aggressive negentropy usage
await wot.load({
    depth: 2,
    negentropyMinAuthors: 2, // Use negentropy even for small batches
});

// Disable negentropy (use subscription-based fetch for all batches)
await wot.load({
    depth: 2,
    useNegentropy: false,
});
```

## Configuration Options

### WoTBuildOptions

- `depth: number` - Maximum depth to traverse (hops from root user)
- `maxFollows?: number` - Maximum follows to process per user (default: 1000)
- `timeout?: number` - Timeout for building the graph in ms
- `useNegentropy?: boolean` - Enable negentropy for batch fetches (default: true)
- `negentropyMinAuthors?: number` - Minimum batch size to use negentropy (default: 5)
- `relayUrls?: string[]` - Specific relays to use (optional)

## Performance

### Test Results

From `test-negentropy-with-cache.ts`:

- **Depth 2 WoT build**: ~30 seconds
- **Total nodes**: 26 (1 root + 5 depth 1 + 20 depth 2)
- **Negentropy sync**: 7 events fetched (4 needed, 3 already had)
- **Cache growth**: 13 events stored

### Bandwidth Savings

Negentropy provides significant bandwidth savings by:
- Only fetching event IDs we don't have
- Skipping events already in cache
- Efficient set reconciliation protocol

## Debug Logging

Enable debug logs to see negentropy in action:

```bash
DEBUG=ndk-wot,ndk-sync npx tsx your-script.ts
```

Example output:
```
ndk-wot Building WOT graph for <pubkey> with depth 2 (negentropy: true, minAuthors: 5)
ndk-wot Processing 1 users at depth 0
ndk-wot Fetching 1 contact lists using subscription
ndk-wot Subscription fetch completed: 2 events
ndk-wot Processing 30 users at depth 1
ndk-wot Attempting negentropy sync for 30 contact lists
ndk-wot Found 2 negentropy-compatible relays out of 2
ndk-wot Negentropy sync completed: 7 events, 4 needed, 3 we have
ndk-wot WOT graph built with 76 nodes in 30290ms
```

## Requirements

- **Cache Adapter**: Required for negentropy to work
- **Compatible Relays**: Relays must support NIP-77 (e.g., strfry-based relays)
- **NDK Sync**: Requires `@nostr-dev-kit/sync` package

## Relay Compatibility

Known compatible relays:
- wss://relay.damus.io (strfry)
- wss://nos.lol (strfry)
- wss://relay.snort.social (strfry)

The implementation automatically detects compatible relays using NIP-11 relay information documents.

## Implementation Details

### fetchContactLists()

Internal method that decides between negentropy and subscription:

```typescript
private async fetchContactLists(options: {
    authors: string[];
    useNegentropy: boolean;
    relayUrls?: string[];
}): Promise<Set<NDKEvent>>
```

Logic:
1. If `useNegentropy === false` or `authors.length < negentropyMinAuthors`: Use subscription
2. Check for negentropy-compatible relays
3. Attempt negentropy sync with cache
4. On error: Fall back to subscription

The threshold check happens in `load()`:
```typescript
useNegentropy: useNegentropy && usersAtDepth.length >= negentropyMinAuthors
```

### fetchViaSubscription()

Reliable subscription-based fetching:

```typescript
private async fetchViaSubscription(authors: string[]): Promise<Set<NDKEvent>>
```

- Uses NDK subscriptions with `closeOnEose: true`
- 30-second timeout
- Returns Set of events

## Testing

Run the test suite:

```bash
# Basic WoT functionality (no negentropy)
npx tsx test-simple-wot.ts

# Test size-based threshold behavior
npx tsx test-threshold.ts

# With negentropy (no cache - will fall back)
npx tsx test-with-negentropy.ts

# With negentropy and cache (full functionality)
npx tsx test-negentropy-with-cache.ts
```

## Future Improvements

- [ ] Parallel negentropy syncs to multiple relays
- [ ] Better retry logic for failed syncs
- [ ] Metrics/statistics on bandwidth saved
- [ ] Progressive loading with partial results
