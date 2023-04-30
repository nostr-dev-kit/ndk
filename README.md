# NDK

<img src="https://raw.githubusercontent.com/nvk/ndk.fyi/master/ndk.svg" alt="drawing" width="200"/>

NDK is a Nostr development kit that makes the experience of building Nostr-related applications, whether they are relays, clients, or anything in between, better, more reliable and overall nicer to work with than existing solutions.

Besides improving the developer experience, the core goal of NDK is to improve the decentralization of Nostr via intelligent conventions and data discovery features without depending on any one central point of coordination (such as large relays or centralized search providers).

## Installation

```sh
npm add @nostr-dev-kit/ndk
```

## Debugging

NDK uses the `debug` package to assist in understanding what's happening behind the hood. If you are building a package
that runs on the server define the `DEBUG` envionment variable like

```
export DEBUG='ndk:*'
```

or in the browser enable it by writing in the DevTools console

```
localStorage.debug = 'ndk:*'
```

## Support

### NDK NIP-28 group chat
 * note15m6rdfvlmd0z836hk83sg7r59xtv23qnmamhsslq5uc6744fdm4qfkeat3
    * [Coracle](https://app.coracle.social/chat/note15m6rdfvlmd0z836hk83sg7r59xtv23qnmamhsslq5uc6744fdm4qfkeat3)
    * [Nostrchat](https://www.nostrchat.io/channel/a6f436a59fdb5e23c757b1e30478742996c54413df777843e0a731af56a96eea)
 * [WIP documentation](https://github.com/nostr-dev-kit/ndk/blob/master/docs/modules.md)

## Features

- [x] NIP-01
- [x] Caching adapters
    * Server-side
        - [x] [Redis](https://github.com/pablof7z/ndk-cache-redis)
        - [ ] In-memory
    * Client-side
        - [ ] LocalStorage
        - [ ] IndexDB
- [~] NIP-04: Encryption support
- [ ] NIP-26: Event delegation
- [ ] NIP-41: Relay authentication
- [x] NIP-57: Zaps
    - [x] LUD06
    - [x] LUD16
- [ ] NIP-65: Contacts' Relay list
- Subscription Management
    - [x] Auto-grouping queries
    - [x] Auto-closing subscriptions
- Signing Adapters
    - [x] Private key
    - [x] NIP-07
    - [ ] NIP-26
    - [x] NIP-46
- Relay discovery
    - [ ] Gossip-model (NIP-65)
    - [ ] Implicit relays discovery following pubkey usage
    - [ ] Implicit relays discovery following `t` tag usage
    - [ ] Explicit relays blacklist
- [ ] nostr-tools/SimplePool drop-in replacement interface

## Instantiate an NDK instance

You can pass an object with several options to a newly created instance of NDK.

-   `explicitRelayUrls` – an array of relay URLs.
-   `signer` - an instance of a [signer](#signers).
-   `cacheAdapter` - an instance of a [Cache Adapter](#caching)
-   `debug` - boolean true/false to turn on degbugging

```ts
// Import the package
import NDK from "@nostr-dev-kit/ndk";
// Create a new NDK instance with explicit relays
ndk = new NDK({ explicitRelayUrls: ["wss://a.relay", "wss://another.relay"] });
```

Note: In normal client use, it's best practice to instantiate NDK as a singleton class. [See more below](#architecture).

## Connecting

After you've instatiated NDK, you need to tell it to connect before you'll be able to interact with any relays.

```ts
// Import the package
import NDK from "@nostr-dev-kit/ndk";
// Create a new NDK instance with explicit relays
ndk = new NDK({ explicitRelayUrls: ["wss://a.relay", "wss://another.relay"] });

// Now connect to specified relays
await ndk.connect();
```

## Signers

NDK uses signers _optionally_ passed in to sign events. Note that it is possible to use NDK without signing events (e.g. [to get someone's profile](https://github.com/nostr-dev-kit/ndk-cli/blob/master/src/commands/profile.ts)).

Signing adapters can be passed in when NDK is instantiated or later during runtime.

### Using a NIP-07 browser extension (e.g. Alby, nos2x)

Instatiate NDK with a NIP-07 signer

```ts
// Import the package, NIP-07 signer and NDK event
import NDK, { NDKNip07Signer, NDKEvent } from "@nostr-dev-kit/ndk";

const nip07signer = new NDKNip07Signer();
const ndk = new NDK({ signer: nip07signer });
```

NDK can now ask for permission, via their NIP-07 extension, to...

**Read the user's public key**

```ts
nip07signer.user().then(async (user) => {
    if (!!user.npub) {
        console.log("Permission granted to read their public key:", user.npub);
    }
});
```

**Sign & publish events**

```ts
const ndkEvent = new NDKEvent(ndk);
ndkEvent.kind = 1;
ndkEvent.content = "Hello, world!";
ndkEvent.publish(); // This will trigger the extension to ask the user to confirm signing.
```

<!-- ### Signing Events via NIP-46

```ts
const signingAdapter = new NDK.RemoteSignerAdapter();
const ndk = new NDK({ signingAdapter });
const event = ndk.event();
event.kind = 0;
event.content = "This event is signed via NIP-46.";
await event.publish();
``` -->

## Caching

NDK provides database-agnostic caching functionality out-of-the-box to improve the performance of your application and reduce load on relays.

NDK will eventually allow you to use multiple caches simultaneously and allow for selective storage of data in the cache store that makes the most sense for your application.

### Where to look is more important that long-term storage

The most important data to cache is _where_ a user or note might be found. UX suffers profoundly when this type of data cannot be found. By design, the Nostr protocol leaves beadcrums of where a user or note might be found and NDK does it's best to store this data automatically and use it when you query for events.

### Instantiating and using a cache adapter

```ts
const redisAdapter = new RedisAdapter(redisUrl);
const ndk = new NDK({ cacheAdapter: redisAdapter });
```

## Buffered queries (COMING SOON)

Clients often need to load data (e.g. profile data) from individual components at once (e.g. initial page render). This typically causes multiple subscriptions to be submitted fetching the same information and causing poor performance or getting rate-limited/maxed out by relays.

NDK implements a convenient subscription model, _buffered queries_, where a named subscription will be created after a customizable amount of time, so that multiple components can append queries.

```ts
// Component 1
ndk.bufferedSubscription({ kinds: [0], authors: ["pubkey-1"] }, "profiles", 500);

// Component 2
ndk.bufferedSubscription({ kinds: [0], authors: ["pubkey-2"] }, "profiles", 500);
```

In this example, NDK will wait 500ms before creating a subscription with the filter:

```ts
{kinds: [0], authors: ['pubkey-1', 'pubkey-2'] }
```

## Intelligent relay selection

When a client submits a request through NDK, NDK will calculate which relays are most likely able to satisfy this request.

Queries submitted by the client might be broken into different queries if NDK computes different relays.

For example, say npub-A follows npub-B and npub-C. If the NDK client uses:

```ts
const ndk = new NDK({ explicitRelays: ["wss://nos.lol"] });
const npubA = ndk.getUser("npub-A");
const feedEvents = await npubA.feed();
```

This would result in the following request:

```json
{ "kinds": [1], "authors": ["npub-B", "npub-C"] }
```

But if NDK has observed that `npub-B` tends to write to `wss://userb.xyz` and
`npub-C` tends to write to `wss://userc.io`, NDK will instead send the following queries.

```json
// to npub-A's explicit relay wss://nos.lol *if* npub-B and npub-C have been seen on that relay
{ "kinds": [1], "authors": [ "npub-B", "npub-C" ] }

// to wss://userb.xyz
{ "kinds": [1], "authors": [ "npub-B" ] }

// to wss://userc.io
{ "kinds": [1], "authors": [ "npub-C" ] }
```

## Auto-closing subscriptions

Often, clients need to fetch data but don't need to maintain an open connection to the relay. This is true of profile metadata requests especially.

-   The `autoclose` flag will make the connection close immediately after EOSE is seen.
-   An integer `autoclose` will close the connection after that amount of ms after EOSE is seen.

```ts
ndk.subscription({ kinds: [0], authors: ["..."] }, { autoclose: true });
```

## Convenience methods

NDK implements several conveience methods for common queries.

### Instantiate a user by npub or hex pubkey

This is a handy method for instantiating a new `NDKUser` and associating the current NDK instance with that user for future calls.

```ts
const pablo = ndk.getUser({
    npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
});

const jeff = ndk.getUser({
    hexpubkey: "1739d937dc8c0c7370aa27585938c119e25c41f6c441a5d34c6d38503e3136ef"
});
```

### Fetch a user's profile and publish updates

You can easily fetch a user's profile data from `kind: 0` events on relays. Calling `.fetchProfile()` will update the `profile` attribute on the user object instead of returning the profile directly. NDK then makes it trivial to update values and publish those updates back to relays.

```ts
const pablo = ndk.getUser({
    npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
});
await pablo.fetchProfile();

const pabloFullProfile = pablo.profile;

pablo.profile.name = "Pablo";
// COMING SOON
await pablo.publish(); // Triggers signing via signer
```

### Finding a single event or all events matching a filter

You can fetch the first event or all events that match a given set of filters.

```ts
// Create a filter
const filter: NDKFilter = { kinds: [1], authors: [hexpubkey1, hexpubkey2] };

// Will return only the first event
event = await ndk.fetchEvent(filter);

// Will return all found events
events = await ndk.fetchEvents(filter);
```

### Creating & publishing events

```ts
const ndk = new NDK({ explicitRelays, signer });
const event = new NDKEvent(ndk);
event.kind = 1;
event.content = "PV Nostr! 🤙🏼";
await ndk.publish(event);
```

### Reacting to an event

```ts
// Find the first event from @jack, and react/like it.
const event = await ndk.fetchEvent({ author: "jack@cashapp.com" })[0];
await event.react("🤙");
```

### Zap an event

```ts
// Find the first event from @jack, and zap it.
const event = await ndk.fetchEvent({ author: "jack@cashapp.com" })[0];
await event.zap(1337, "Zapping your post!"); // Returns a zap request
```

## Architecture decisions & suggestions

-   Users of NDK should instantiate a single NDK instance.
-   That instance tracks state with all relays connected, explicit and otherwise.
-   All relays are tracked in a single pool that handles connection errors/reconnection logic.
-   RelaySets are assembled ad-hoc as needed depending on the queries set, although some RelaySets might be long-lasting, like the `explicitRelays` specified by the user.
-   RelaySets are always a subset of the pool of all available relays.
