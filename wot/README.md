# @nostr-dev-kit/wot

Web of Trust utilities for NDK.

## Installation

```bash
npm install @nostr-dev-kit/wot
```

## Usage

### Build WOT Graph

```typescript
import NDK from "@nostr-dev-kit/ndk";
import { NDKWoT } from "@nostr-dev-kit/wot";

const ndk = new NDK();
await ndk.connect();

// Build WOT graph from a user's perspective
const wot = new NDKWoT(ndk, myPubkey);
await wot.load({
    depth: 2,           // 2 hops out
    maxFollows: 1000,   // limit follows per user
    timeout: 30000      // 30s timeout
});

console.log(`WOT has ${wot.size} users`);
```

### Filter Events

```typescript
import { filterByWoT } from "@nostr-dev-kit/wot";

// Fetch events broadly
const events = await ndk.fetchEvents({ kinds: [1], limit: 500 });

// Filter by WOT
const filtered = filterByWoT(wot, events, {
    maxDepth: 2,           // only users within 2 hops
    minScore: 0.5,         // minimum WOT score
    includeUnknown: false  // exclude users outside WOT
});

// Adjust filter without re-fetching
const broader = filterByWoT(wot, events, { maxDepth: 3 });
const strictest = filterByWoT(wot, events, { maxDepth: 1 });
```

### Rank Events

```typescript
import { rankByWoT } from "@nostr-dev-kit/wot";

// Rank events by WOT
const ranked = rankByWoT(wot, events, {
    algorithm: "distance",  // "distance", "score", or "followers"
    unknownsLast: true      // put unknown users at the end
});

// Or use a custom comparator
const custom = rankByWoT(wot, events, {
    comparator: (a, b) => {
        // Custom ranking logic
        return wot.getScore(b.pubkey) - wot.getScore(a.pubkey);
    }
});

// Or create a comparator for manual sorting
import { createWoTComparator } from "@nostr-dev-kit/wot";

const comparator = createWoTComparator(wot, { algorithm: "distance" });
events.sort(comparator);
```

### WOT Queries

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

- **distance**: Ranks by graph distance (closer = higher)
- **score**: Ranks by WOT score (inverse of depth)
- **followers**: Ranks by number of WOT users following them

## API

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

### Filter Functions

- `filterByWoT(wot, events, options)` - Filter events by WOT
- `rankByWoT(wot, events, options)` - Rank events by WOT
- `createWoTComparator(wot, options)` - Create comparator function

## License

MIT
