# Exclusive Relay Subscriptions

By default, NDK subscriptions use cross-subscription matching: when an event comes in from any relay, it's delivered to all subscriptions whose filters match, regardless of which relays the subscription was targeting.

The `exclusiveRelay` option allows you to create subscriptions that **only** accept events from their specified relays, ignoring events that match the filter but come from other relays.

## Basic Usage

```typescript
import NDK from '@nostr-dev-kit/ndk';

const ndk = new NDK({
  explicitRelayUrls: [
    'wss://relay-a.com',
    'wss://relay-b.com',
    'wss://relay-c.com'
  ]
});

await ndk.connect();

// Subscription that ONLY accepts events from relay-a.com
const exclusiveSub = ndk.subscribe(
  { kinds: [1], authors: ['pubkey...'] },
  {
    relayUrls: ['wss://relay-a.com'],
    exclusiveRelay: true,  // 🔑 Key option
    onEvent: (event) => {
      console.log('Event from relay-a.com:', event.content);
      // This will ONLY fire for events from relay-a.com
      // Events from relay-b.com or relay-c.com are rejected
    }
  }
);
```

## Default Behavior (Cross-Subscription Matching)

Without `exclusiveRelay`, subscriptions receive events from any relay:

```typescript
// Default behavior - accepts events from ANY relay
const normalSub = ndk.subscribe(
  { kinds: [1], authors: ['pubkey...'] },
  {
    relayUrls: ['wss://relay-a.com'],
    exclusiveRelay: false,  // or omit (default)
    onEvent: (event) => {
      // This fires for events from relay-a.com, relay-b.com, relay-c.com
      // or any other relay, as long as the filter matches
    }
  }
);
```

## Use Cases

### 1. Relay-Specific Data Fetching

Fetch events exclusively from a specific relay:

```typescript
// Only get events from a specific community relay
const communitySub = ndk.subscribe(
  { kinds: [1], '#t': ['community'] },
  {
    relayUrls: ['wss://community-relay.example.com'],
    exclusiveRelay: true
  }
);
```

### 2. Relay Isolation Testing

Test relay-specific behavior:

```typescript
// Test what a specific relay returns
const testSub = ndk.subscribe(
  { kinds: [1], limit: 10 },
  {
    relayUrls: ['wss://test-relay.com'],
    exclusiveRelay: true,
    closeOnEose: true,
    onEose: () => {
      console.log('Finished fetching from test-relay.com');
    }
  }
);
```

### 3. Relay-Based Routing

Route events based on relay provenance:

```typescript
const publicRelaySub = ndk.subscribe(
  { kinds: [1] },
  {
    relayUrls: ['wss://public-relay.com'],
    exclusiveRelay: true,
    onEvent: (event) => {
      console.log('Public event:', event.content);
    }
  }
);

const privateRelaySub = ndk.subscribe(
  { kinds: [1] },
  {
    relayUrls: ['wss://private-relay.com'],
    exclusiveRelay: true,
    onEvent: (event) => {
      console.log('Private event:', event.content);
    }
  }
);
```

## Using NDKRelaySet

You can also use `NDKRelaySet` with `exclusiveRelay`:

```typescript
import { NDKRelaySet } from '@nostr-dev-kit/ndk';

const relaySet = NDKRelaySet.fromRelayUrls(
  ['wss://relay-a.com', 'wss://relay-b.com'],
  ndk
);

const sub = ndk.subscribe(
  { kinds: [1] },
  {
    relaySet,
    exclusiveRelay: true
  }
);

// Only receives events from relay-a.com or relay-b.com
```

## Edge Cases

### Cached Events

Cached events are checked against their known relay provenance. If a cached event was previously seen on a relay in your exclusive relaySet, it will be delivered:

```typescript
const sub = ndk.subscribe(
  { kinds: [1] },
  {
    relayUrls: ['wss://relay-a.com'],
    exclusiveRelay: true,
    cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST
  }
);

// Cached events that came from relay-a.com: ✅ Delivered
// Cached events from other relays: ❌ Rejected
```

### Optimistic Publishes

Optimistic publishes (local events before relay confirmation) respect the `skipOptimisticPublishEvent` setting:

```typescript
const sub = ndk.subscribe(
  { kinds: [1] },
  {
    relayUrls: ['wss://relay-a.com'],
    exclusiveRelay: true,
    skipOptimisticPublishEvent: false  // Accept optimistic publishes
  }
);

// Optimistic publishes: ✅ Delivered (if skipOptimisticPublishEvent is false)
```

### No RelaySet Specified

If `exclusiveRelay: true` but no `relaySet` or `relayUrls` is specified, the check is not applied:

```typescript
const sub = ndk.subscribe(
  { kinds: [1] },
  {
    exclusiveRelay: true  // Has no effect without relaySet/relayUrls
  }
);

// Behaves like a normal subscription - accepts events from any relay
```

## Combining Exclusive and Non-Exclusive Subscriptions

You can mix exclusive and non-exclusive subscriptions in the same NDK instance:

```typescript
// Exclusive subscription - only relay-a.com
const exclusiveSub = ndk.subscribe(
  { kinds: [1], '#t': ['exclusive'] },
  {
    relayUrls: ['wss://relay-a.com'],
    exclusiveRelay: true
  }
);

// Non-exclusive subscription - any relay
const globalSub = ndk.subscribe(
  { kinds: [1], '#t': ['global'] },
  {
    exclusiveRelay: false
  }
);

// exclusiveSub: Only gets #t=exclusive events from relay-a.com
// globalSub: Gets #t=global events from any connected relay
```

## Performance Considerations

The `exclusiveRelay` check happens after filter matching, so there's minimal performance impact. The check only applies to subscriptions that have both:
- `exclusiveRelay: true`
- A specified `relaySet` or `relayUrls`

All other subscriptions skip the relay provenance check entirely.
