# Usage

## Instantiate an NDK instance

You can pass an object with several options to a newly created instance of NDK.

- `explicitRelayUrls` – an array of relay URLs.
- `signer` - an instance of a [signer](#signers).
- `cacheAdapter` - an instance of a [Cache Adapter](#caching)
- `debug` - Debug instance to use for logging. Defaults to `debug("ndk")`.

```ts
// Import the package
import NDK from "@nostr-dev-kit/ndk";

// Create a new NDK instance with explicit relays
const ndk = new NDK({
    explicitRelayUrls: ["wss://a.relay", "wss://another.relay"],
});
```

If the signer implements the `getRelays()` method, NDK will use the relays returned by that method as the explicit
relays.

```ts
// Import the package
import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";

// Create a new NDK instance with just a signer (provided the signer implements the getRelays() method)
const nip07signer = new NDKNip07Signer();
const ndk = new NDK({ signer: nip07signer });
```

Note: In normal client use, it's best practice to instantiate NDK as a singleton
class. [See more below](#architecture-decisions--suggestions).

## Connecting

After you've instatiated NDK, you need to tell it to connect before you'll be able to interact with any relays.

```ts
// Import the package
import NDK from "@nostr-dev-kit/ndk";

// Create a new NDK instance with explicit relays
const ndk = new NDK({
    explicitRelayUrls: ["wss://a.relay", "wss://another.relay"],
});
// Now connect to specified relays
await ndk.connect();
```

## Creating Users

NDK provides flexible ways to fetch user objects, including support for NIP-19 encoded identifiers and NIP-05 addresses:

```typescript
// From hex pubkey
const user1 = await ndk.fetchUser("3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d");

// From npub (NIP-19 encoded)
const user2 = await ndk.fetchUser("npub1n0sturny6w9zn2wwexju3m6asu7zh7jnv2jt2kx6tlmfhs7thq0qnflahe");

// From nprofile (includes relay hints)
const user3 = await ndk.fetchUser("nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p");

// From NIP-05 identifier
const user4 = await ndk.fetchUser("pablo@test.com");
const user5 = await ndk.fetchUser("test.com"); // Uses _@test.com

// The method automatically detects the format
const user6 = await ndk.fetchUser("deadbeef..."); // Assumes hex pubkey
```

Note: `fetchUser` is async and returns a Promise. For NIP-05 lookups, it may return `undefined` if the address cannot be
resolved.

## Working with NIP-19 Identifiers

NDK re-exports NIP-19 utilities for encoding and decoding Nostr identifiers:

```typescript
import { nip19 } from '@nostr-dev-kit/ndk';

// Encode a pubkey as npub
const npub = nip19.npubEncode("3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d");

// Decode any NIP-19 identifier
const decoded = nip19.decode("npub1...");
console.log(decoded.type); // "npub"
console.log(decoded.data); // hex pubkey

// Encode events
const nevent = nip19.neventEncode({
    id: eventId,
    relays: ["wss://relay.example.com"],
    author: authorPubkey
});
```

See the [NIP-19 tutorial](/tutorial/nip19.html) for comprehensive examples and use cases.

## Usage with React Hooks (`ndk-hooks`)

When using the `ndk-hooks` package in a React application, the initialization process involves creating the NDK instance
and then using the `useNDKInit` hook to make it available to the rest of your application via Zustand stores.

This hook ensures that both the core NDK store and dependent stores (like the user profiles store) are properly
initialized with the NDK instance.

It's recommended to create and connect your NDK instance outside of your React components, potentially in a dedicated
setup file or at the root of your application. Then, use the `useNDKInit` hook within your main App component or a
context provider to initialize the stores once the component mounts.

```tsx
import React, { useEffect } from 'react'; // Removed useState
import NDK from '@nostr-dev-kit/ndk';
import { useNDKInit } from '@nostr-dev-kit/ndk-hooks'; // Assuming package name

// 1. Configure your NDK instance (e.g., in src/ndk.ts or similar)
const ndk = new NDK({
    explicitRelayUrls: ['wss://relay.damus.io', 'wss://relay.primal.net'],
    // Add signer or cache adapter if needed
});

// 2. Connect the instance immediately
ndk.connect()
    .then(() => console.log('NDK connected'))
    .catch((e) => console.error('NDK connection error:', e));

// Example: App component or Context Provider that initializes NDK stores
function App() {
    const initializeNDK = useNDKInit(); // Hook returns the function directly

    useEffect(() => {
        // 3. Initialize stores once the component mounts
        initializeNDK(ndk);
    }, [initializeNDK]); // Dependency ensures this runs if initializeNDK changes, though unlikely

    // Your application components can now use other ndk-hooks
    // No need to wait for connection state here, as hooks handle NDK readiness internally
    return (
        <div>
            {/* ... Your app content using useProfile, useSubscribe, etc. ... */}
        </div>
    );
}

export default App;
```

**Key Points:**

* Create and configure your `NDK` instance globally or outside components.
* Call `ndk.connect()` immediately after creation. Connection happens in the background.
* In your main App or Provider component, get the `initializeNDK` function from `useNDKInit`.
* Use `useEffect` with an empty dependency array (or `[initializeNDK]`) to call `initializeNDK(ndk)` once on mount.
* This sets up the necessary Zustand stores. Other `ndk-hooks` will access the initialized `ndk` instance from the store
  and handle its readiness internally.

---

## Architecture decisions & suggestions

- Users of NDK should instantiate a single NDK instance.
- That instance tracks state with all relays connected, explicit and otherwise.
- All relays are tracked in a single pool that handles connection errors/reconnection logic.
- RelaySets are assembled ad-hoc as needed depending on the queries set, although some RelaySets might be long-lasting,
  like the `explicitRelayUrls` specified by the user.
- RelaySets are always a subset of the pool of all available relays.

## Subscribing to Events

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
