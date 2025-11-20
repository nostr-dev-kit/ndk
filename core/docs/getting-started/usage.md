# Usage

## Quick Start

A simple example of how to use NDK in a Node.js application:

<<< @/core/docs/snippets/quick-start-with-guardrails.ts

## NDK Usage

### Instantiate NDK

You can pass an object with several options to a newly created instance of NDK.

- `explicitRelayUrls` – an array of relay URLs.
- `signer` - an instance of a signer ([signer documentation](/core/docs/fundamentals/signers.md)).
- `cacheAdapter` - an instance of a cache adapter.
- `debug` - debugger instance ([debugging documentation](/core/docs/getting-started/debugging.md)).

<<< @/core/docs/snippets/initialise.ts

Note: In normal client use, it's best practice to instantiate NDK as a singleton
class. [See more below](#architecture-decisions--suggestions).

### Connecting

After you've instantiated NDK, you need to tell it to connect before you'll be able to interact with any relays.

<<< @/core/docs/snippets/connecting.ts

### Using NIP-19 Identifiers

NDK re-exports [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) from the
[nostr-tools library](https://github.com/nbd-wtf/nostr-tools) which provides different utilities for encoding and
decoding Nostr identifiers:

<<< @/core/docs/snippets/nip-19-identifiers.ts

### Managing Users

NDK provides flexible ways to fetch user objects, including support for
[NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) encoded identifiers
and [NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md) addresses:

<<< @/core/docs/snippets/managing-users.ts

Note: `fetchUser` is async and returns a Promise. For [NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md)
lookups, it may return `undefined` if the address cannot be resolved.

See the [NIP-19 tutorial](/core/docs/tutorial/nip19.md) for comprehensive examples and use cases.

### Frameworks Integrations

If you're planning to use `NDK` in a react framework, check out the documentation for these specific packages:

* [@nostr-dev-kit/react](/react/README.md): Hooks and utilities to integrate NDK into a React applications
* [@nostr-dev-kit/svelte](/svelte/README.md): Modern, performant, and beautiful Svelte 5 integration

### Subscribing to Events

Once connected, you can subscribe to events using `ndk.subscribe()`. You provide filters to specify the events you're
interested in.

### Preferred Method: Direct Event Handlers

The **recommended** way to handle events is to provide handler functions directly when calling `ndk.subscribe()`. This
is done using the third argument (`autoStart`), which accepts an object containing `onEvent`, `onEvents`, and/or
`onEose` callbacks.

**Why is this preferred?** Subscriptions can start receiving events (especially from a fast cache) almost immediately
after `ndk.subscribe()` is called. By providing handlers directly, you ensure they are attached *before* any events are
emitted, preventing potential race conditions where you might miss the first few events if you attached handlers later
using `.on()`.

```typescript
// Example with default relay calculation
ndk.subscribe(
    { kinds: [1], authors: [pubkey] }, // Filters
    { closeOnEose: true }, // Options (no explicit relays specified)
    { // Direct handlers via autoStart parameter (now the 3rd argument)
        onEvent: (event: NDKEvent, relay?: NDKRelay) => {
            // Called for events received from relays after the initial cache load (if onEvents is used)
            console.log("Received event from relay (id):", event.id);
        },
        onEvents: (events: NDKEvent[]) => { // Parameter renamed to 'events'
            console.log(`Received ${events.length} events from cache initially.`);
        },
        onEose: (subscription: NDKSubscription) => {
            console.log("Subscription reached EOSE:", subscription.internalId);
        }
    }
);

// Example specifying explicit relays using relayUrls option
ndk.subscribe(
    { kinds: [0], authors: [pubkey] }, // Filters
    { // Options object now includes relayUrls
        closeOnEose: true,
        relayUrls: ["wss://explicit1.relay", "wss://explicit2.relay"]
    },
    { // Direct handlers
        onEvent: (event: NDKEvent) => { /* ... */ }
    }
);

// Example specifying explicit relays using relaySet option
const explicitRelaySet = NDKRelaySet.fromRelayUrls(["wss://explicit.relay"], ndk);
ndk.subscribe(
    { kinds: [7], authors: [pubkey] }, // Filters
    { // Options object now includes relaySet
        closeOnEose: true,
        relaySet: explicitRelaySet
    },
    { // Direct handlers
        onEvent: (event: NDKEvent) => { /* ... */ }
    }
);
```

### Efficient Cache Handling with `onEvents`

Using the `onEvents` handler provides an efficient way to process events loaded from the cache. When you provide
`onEvents`:

1. If NDK finds matching events in its cache *synchronously* when the subscription starts, `onEvents` is called **once**
   with an array of all those cached events.
2. The `onEvent` handler is **skipped** for this initial batch of cached events.
3. `onEvent` will still be called for any subsequent events received from relays or later asynchronous cache updates.

This is ideal for scenarios like populating initial UI state, as it allows you to process the cached data in a single
batch, preventing potentially numerous individual updates that would occur if `onEvent` were called for each cached
item.

If you *don't* provide `onEvents`, the standard `onEvent` handler will be triggered for every event, whether it comes
from the cache or a relay.

### Alternative Method: Attaching Handlers with `.on()`

You can also attach event listeners *after* creating the subscription using the `.on()` method. While functional, be
mindful of the potential race condition mentioned above, especially if you rely on immediate cache results.

```typescript
// Subscribe using default relay calculation
const subscription = ndk.subscribe(
    { kinds: [1], authors: [pubkey] },
    { closeOnEose: true } // Options
);

// Subscribe using explicit relays via options
const subscriptionWithRelays = ndk.subscribe(
    { kinds: [0], authors: [pubkey] },
    { relayUrls: ["wss://explicit.relay"] } // Options with explicit relays
);

// Attach handlers later
subscription.on("event", (event) => {
    console.log("Received event:", event.id);
});
subscription.on("eose", () => {
    console.log("Initial events loaded");
});

// Remember to stop the subscription when it's no longer needed
// setTimeout(() => subscription.stop(), 5000);
