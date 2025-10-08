# NDK Outbox Model Implementation Report

## Executive Summary

The outbox model in Nostr is a decentralized relay selection strategy that solves the "relay rendezvous problem" - ensuring users can find each other's content without centralizing around a few large relays. NDK implements this model through sophisticated relay tracking, intelligent routing, and dynamic relay selection mechanisms that follow the NIP-65 specification.

## The Outbox Model Concept

### Background and Problem

Originally called the "Gossip Model" after the Gossip client that pioneered it, the outbox model addresses a critical challenge in Nostr: without coordination, users tend to centralize around the same large relays to ensure message delivery. This centralization weakens Nostr's censorship resistance - an attacker only needs to take down about 5 major relays to disrupt half the network.

### Core Principles

The outbox model works similarly to the web/RSS model:

- **Outbox Relays**: You post your content to your own designated relays
- **Inbox Relays**: You designate relays where you want to receive messages
- **Dynamic Discovery**: Clients discover and connect to relays based on where users actually post

### NIP-65 Specification

The protocol is formalized in NIP-65, which defines:

- **Kind 10002 events**: Relay list metadata containing read/write relay preferences
- **Relay tags**: "r" tags with optional "read"/"write" markers
- **Fallback to Kind 3**: Contact list events can contain relay information in their content

## NDK's Implementation Architecture

### 1. Outbox Tracker (`OutboxTracker`)

The central component that maintains relay associations for users:

```typescript
class OutboxTracker extends EventEmitter {
    public data: LRUCache<Hexpubkey, OutboxItem>;

    // Tracks users and fetches their relay lists
    async trackUsers(items: NDKUser[] | Hexpubkey[], skipCache = false);

    // Each OutboxItem contains:
    // - readRelays: Set<WebSocket["url"]>
    // - writeRelays: Set<WebSocket["url"]>
    // - relayUrlScores: Map<WebSocket["url"], number>
}
```

Key features:

- **LRU Cache**: Stores up to 100,000 entries with 2-minute expiration
- **Batch Processing**: Handles up to 400 users at a time
- **Blacklist Filtering**: Removes blacklisted relays from discovered lists
- **Automatic Fetching**: Retrieves NIP-65 relay lists (kind 10002) and falls back to kind 3

### 2. Relay Selection for Reading

The `chooseRelayCombinationForPubkeys` function implements intelligent relay selection:

```typescript
function chooseRelayCombinationForPubkeys(
    ndk: NDK,
    pubkeys: Hexpubkey[],
    type: "write" | "read",
    { count = 2, preferredRelays }: Options,
): Map<WebSocket["url"], Hexpubkey[]>;
```

Selection algorithm:

1. **Fetch relay lists** for all requested pubkeys
2. **Prioritize connected relays** that are already in the pool
3. **Use relay ranking** to select optimal relays when not all are needed
4. **Fallback to pool relays** for users without relay lists
5. **Return relay-to-authors mapping** for efficient querying

### 3. Relay Selection for Writing

The `calculateRelaySetFromEvent` function determines where to publish:

```typescript
async function calculateRelaySetFromEvent(
    ndk: NDK,
    event: NDKEvent,
    requiredRelayCount?: number,
): Promise<NDKRelaySet>;
```

Publishing strategy:

1. **Author's write relays**: Primary destination from the author's relay list
2. **Relay hints**: Extract from "a" and "e" tags (up to 5 unique URLs)
3. **P-tagged user relays**: Include read relays of mentioned users (if < 5 tags)
4. **Pool permanent relays**: Always include connected permanent relays
5. **Explicit relay URLs**: Fill remaining slots from NDK configuration

### 4. Relay Ranking System

The `getTopRelaysForAuthors` function ranks relays by usage:

```typescript
function getTopRelaysForAuthors(ndk: NDK, authors: Hexpubkey[]): WebSocket["url"][];
```

Current implementation:

- Counts how many authors write to each relay
- Sorts relays by author count (most popular first)
- TODO: Incorporate relay scoring for quality metrics

### 5. Subscription Integration

Subscriptions automatically use outbox model for filters with authors:

```typescript
// In calculateRelaySetsFromFilter
if (authors.size > 0) {
    const authorToRelaysMap = getRelaysForFilterWithAuthors(ndk, Array.from(authors));
    // Creates per-relay filters with appropriate author subsets
}
```

This ensures queries are sent only to relays where the requested authors actually post.

## Implementation Flow

### Reading Events (Subscription)

1. User creates subscription with author filter
2. NDK checks OutboxTracker for author relay lists
3. Missing relay lists are fetched from the network
4. Relay selection algorithm chooses optimal relay combination
5. Subscription is split into relay-specific filters
6. Each relay receives only relevant author queries

### Writing Events (Publishing)

1. User publishes an event
2. NDK fetches author's write relays from OutboxTracker
3. Additional relays added from tags and mentions
4. Event is published to the calculated relay set
5. Successful publishes update relay statistics

### Dynamic Relay Discovery

1. OutboxTracker monitors author queries
2. Fetches relay lists (NIP-65) for tracked users
3. Falls back to kind 3 contact lists if needed
4. Caches results with LRU eviction
5. Filters out blacklisted relays

## Benefits of NDK's Implementation

1. **Decentralization**: Users spread across many relays instead of centralizing
2. **Efficiency**: Queries target specific relays rather than broadcasting
3. **Censorship Resistance**: No single point of failure
4. **Performance**: Reduced query overhead and network traffic
5. **Flexibility**: Users can change relays without losing followers

## Technical Details

### Relay List Storage (NIP-65)

```typescript
class NDKRelayList extends NDKEvent {
    get readRelayUrls(): WebSocket["url"][]; // "r" tags with "read" marker
    get writeRelayUrls(): WebSocket["url"][]; // "r" tags with "write" marker
    get bothRelayUrls(): WebSocket["url"][]; // "r" tags without marker
}
```

### Outbox Pool Configuration

NDK supports a separate pool for outbox operations:

- `ndk.outboxPool`: Dedicated pool for fetching relay lists
- Falls back to main pool if not configured
- Enables separation of metadata queries from content

### Cache Integration

- Relay lists are cached to reduce network requests
- Unpublished events tracked for optimistic updates
- Cache-first strategy with fallback to network
- Configurable cache expiration and size limits

## Future Enhancements

1. **Relay Scoring**: The current implementation notes TODO for incorporating relay quality metrics
2. **Tag-based Routing**: Consider relays where specific hashtags are popular
3. **Adaptive Strategies**: Adjust relay count based on event importance
4. **Performance Metrics**: Track success rates and optimize selection

## Conclusion

NDK's outbox implementation represents a sophisticated approach to decentralized content routing in Nostr. By dynamically discovering and intelligently selecting relays based on actual user behavior, it achieves the goals of censorship resistance and network efficiency while maintaining a good user experience. The implementation follows NIP-65 standards while providing flexibility for future enhancements and optimizations.
