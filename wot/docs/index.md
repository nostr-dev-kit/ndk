# Web of Trust (WOT)

`@nostr-dev-kit/ndk-wot` provides Web of Trust utilities for filtering and ranking content based on your social graph.

## Installation

```bash
npm install @nostr-dev-kit/ndk-wot
```

## Quick Start

```typescript
import NDK from "@nostr-dev-kit/ndk";
import { NDKWoT, filterByWoT, rankByWoT } from "@nostr-dev-kit/ndk-wot";

const ndk = new NDK();
await ndk.connect();

// Build WOT graph from your perspective
const wot = new NDKWoT(ndk, myPubkey);
await wot.load({
    depth: 2,           // 2 hops out from you
    maxFollows: 1000,   // limit follows per user
    timeout: 30000      // 30s timeout
});

console.log(`WOT has ${wot.size} users`);
```

## Filtering Events

The key insight of WOT is to **fetch broadly, filter locally**. This lets you adjust WOT strictness without re-fetching from relays.

```typescript
// Fetch events broadly
const events = await ndk.fetchEvents({
    kinds: [1],
    limit: 500
});

// Filter by WOT
const filtered = filterByWoT(wot, events, {
    maxDepth: 2,           // only users within 2 hops
    minScore: 0.5,         // minimum WOT score (0-1)
    includeUnknown: false  // exclude users outside WOT
});

// Easily adjust view without re-fetching
const broader = filterByWoT(wot, events, { maxDepth: 3 });
const strictest = filterByWoT(wot, events, { maxDepth: 1 });
```

## WOT as Automatic Mute Filter

You can integrate WOT with NDK's `muteFilter` to automatically filter out users outside your web of trust at the NDK level. This means all subscriptions and event fetches will automatically exclude non-WOT users.

```typescript
import NDK, { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKWoT } from "@nostr-dev-kit/ndk-wot";

const ndk = new NDK();
await ndk.connect();

// Build WOT graph
const wot = new NDKWoT(ndk, myPubkey);
await wot.load({ depth: 2 });

// Set WOT-based mute filter
ndk.muteFilter = (event: NDKEvent) => {
    // Check manual mutes first
    if (ndk.mutedIds.has(event.pubkey)) return true;
    if (event.id && ndk.mutedIds.has(event.id)) return true;

    // Auto-mute users outside WOT
    if (!wot.includes(event.pubkey, { maxDepth: 2 })) {
        return true; // Mute this event
    }

    return false; // Don't mute
};

// Now all subscriptions automatically filter by WOT
const sub = ndk.subscribe({ kinds: [1], limit: 100 });
sub.on('event', (event) => {
    // Only events from WOT users will appear here
    console.log(event.content);
});
```

### Hybrid Approach: WOT + Manual Mutes + Keywords

Combine WOT with manual mutes and content filtering:

```typescript
ndk.muteFilter = (event: NDKEvent) => {
    // 1. Manual mutes (highest priority)
    if (ndk.mutedIds.has(event.pubkey)) return true;
    if (event.id && ndk.mutedIds.has(event.id)) return true;

    // 2. WOT check (only for unknown users)
    if (!wot.includes(event.pubkey, { maxDepth: 2 })) {
        return true; // Auto-mute non-WOT users
    }

    // 3. Content filtering (even for WOT users)
    const blockedWords = ['spam', 'scam'];
    if (blockedWords.some(word => event.content.toLowerCase().includes(word))) {
        return true;
    }

    return false;
};
```

### Adjustable WOT Strictness

Allow users to adjust WOT strictness dynamically:

```typescript
let wotDepth = 2; // Default: 2 hops

ndk.muteFilter = (event: NDKEvent) => {
    if (ndk.mutedIds.has(event.pubkey)) return true;

    // Use current depth setting
    return !wot.includes(event.pubkey, { maxDepth: wotDepth });
};

// User can adjust strictness
function setWoTStrictness(depth: number) {
    wotDepth = depth;
    // Trigger UI refresh to re-apply filter
}

// Slider: 1 (strictest) -> 3 (most permissive)
setWoTStrictness(1); // Only direct follows
setWoTStrictness(2); // Friends of friends
setWoTStrictness(3); // 3 hops out
```

### WOT-Based Score Thresholds

Filter by WOT score instead of depth:

```typescript
const MIN_WOT_SCORE = 0.5; // 0-1 scale

ndk.muteFilter = (event: NDKEvent) => {
    if (ndk.mutedIds.has(event.pubkey)) return true;

    // Mute if score too low
    const score = wot.getScore(event.pubkey);
    if (score < MIN_WOT_SCORE) {
        return true;
    }

    return false;
};
```

## Ranking Events

Sort events by WOT proximity:

```typescript
// Rank by distance (closer = higher)
const ranked = rankByWoT(wot, events, {
    algorithm: "distance",  // "distance", "score", or "followers"
    unknownsLast: true      // put unknown users at the end
});

// Custom ranking
const custom = rankByWoT(wot, events, {
    comparator: (a, b) => {
        const aScore = wot.getScore(a.pubkey);
        const bScore = wot.getScore(b.pubkey);
        return bScore - aScore;
    }
});
```

## WOT Queries

```typescript
// Check if user is in WOT
if (wot.includes(pubkey, { maxDepth: 2 })) {
    console.log("User is in WOT");
}

// Get WOT score (0-1, higher = closer)
const score = wot.getScore(pubkey);

// Get distance (hops from root)
const distance = wot.getDistance(pubkey); // returns number or null

// Get scores for multiple users
const scores = wot.getScores([pubkey1, pubkey2, pubkey3]);

// Get all pubkeys in WOT
const allUsers = wot.getAllPubkeys({ maxDepth: 2 });
```

## Ranking Algorithms

### Distance
Ranks by graph distance from root user. Closer users rank higher.

```typescript
rankByWoT(wot, events, { algorithm: "distance" });
```

### Score
Ranks by WOT score (inverse of depth: `1 / (depth + 1)`). Higher scores rank higher.

```typescript
rankByWoT(wot, events, { algorithm: "score" });
```

### Followers
Ranks by number of WOT users following them. More popular within your WOT ranks higher.

```typescript
rankByWoT(wot, events, { algorithm: "followers" });
```

## Integration with Reactive Frameworks

Use with `ndk-svelte5` or `ndk-hooks` for reactive WOT views:

### Svelte 5 (coming soon)
```typescript
import { wotView } from '@nostr-dev-kit/ndk-svelte5';

const view = wotView(wot, events, {
  maxDepth: $state(2),
  showUnknowns: $state(false)
});

// Reactive
$effect(() => {
  console.log(view.filtered);
});
```

### React (coming soon)
```typescript
import { useWoTView } from '@nostr-dev-kit/ndk-hooks';

function Feed() {
  const [depth, setDepth] = useState(2);

  const { filtered, ranked } = useWoTView(wot, events, {
    maxDepth: depth
  });

  return <EventList events={filtered} />;
}
```

## API Reference

### NDKWoT

- `constructor(ndk: NDK, rootPubkey: string)` - Create WOT instance
- `load(options: WoTBuildOptions): Promise<void>` - Build the graph
- `getScore(pubkey: string): number` - Get WOT score (0-1)
- `getDistance(pubkey: string): number | null` - Get hops from root
- `includes(pubkey: string, options?): boolean` - Check if in WOT
- `getAllPubkeys(options?): string[]` - Get all pubkeys in WOT
- `getScores(pubkeys: string[]): Map<string, number>` - Batch scores
- `getNode(pubkey: string): WoTNode | null` - Get WOT node details
- `size: number` - Total nodes in graph
- `isLoaded(): boolean` - Check if graph is loaded

### Filter Functions

#### filterByWoT
```typescript
filterByWoT(
  wot: NDKWoT,
  events: NDKEvent[],
  options: WoTFilterOptions
): NDKEvent[]
```

#### rankByWoT
```typescript
rankByWoT(
  wot: NDKWoT,
  events: NDKEvent[],
  options: WoTRankOptions
): NDKEvent[]
```

#### createWoTComparator
```typescript
createWoTComparator(
  wot: NDKWoT,
  options: WoTRankOptions
): (a: NDKEvent, b: NDKEvent) => number
```

## Types

### WoTBuildOptions
```typescript
interface WoTBuildOptions {
    depth: number;        // Max hops to traverse
    maxFollows?: number;  // Max follows per user
    timeout?: number;     // Timeout in ms
}
```

### WoTFilterOptions
```typescript
interface WoTFilterOptions {
    maxDepth?: number;      // Max depth to include
    minScore?: number;      // Min WOT score (0-1)
    includeUnknown?: boolean; // Include non-WOT users
}
```

### WoTRankOptions
```typescript
interface WoTRankOptions {
    algorithm?: "distance" | "score" | "followers";
    unknownsLast?: boolean;
    comparator?: (a: NDKEvent, b: NDKEvent) => number;
}
```

### WoTNode
```typescript
interface WoTNode {
    pubkey: string;
    depth: number;             // Hops from root
    followedBy: Set<string>;   // Who follows this user
}
```
