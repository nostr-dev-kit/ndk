# NDK

<img src="https://raw.githubusercontent.com/nvk/ndk.fyi/master/ndk.svg" alt="drawing" width="200"/>

NDK is a [nostr](<[url](https://github.com/nostr-protocol/nostr)>) development kit that makes the experience of building Nostr-related applications, whether they are relays, clients, or anything in between, better, more reliable and overall nicer to work with than existing solutions.

## Monorepo

This repository contains multiple packages:

-   [@nostr-dev-kit/ndk](./ndk) – The core NDK package
-   [@nostr-dev-kit/ndk-cache-dexie](./ndk-cache-dexie) – A caching adapter for the browser using [Dexie](https://dexie.org/)
-   [@nostr-dev-kit/ndk-cache-redis](./ndk-cache-redis) – A caching adapter for the server using [Redis](https://redis.io/)
-   [@nostr-dev-kit/ndk-svelte](./ndk-svelte) – Convenience functionalities to make using Svelte+NDK nicer.
-   [@nostr-dev-kit/ndk-svelte-components](./ndk-svelte-components) – Minimally styled Svelte components for common NDK use cases.

## NDK Objectives

1. The core goal of NDK is to improve the decentralization of Nostr via intelligent conventions and data discovery features without depending on any one central point of coordination (such as large relays or centralized search providers).
2. NDK team aims to have new to nostr devs get set up, and read a NIP-01 event within 10 minutes.
3. NDK's objective is to serve prospective, and current nostr devs as clients. If you have friction with the NDK developer experience, please open issues, and ask for help from the NDK team! Devs are encouraged to search through existing, and/or create new GitHub issues when experiencing friction with NDK.

## Installation

```sh
npm add @nostr-dev-kit/ndk
```

## Debugging

NDK uses the `debug` package to assist in understanding what's happening behind the hood. If you are building a package
that runs on the server defines the `DEBUG` environment variable like

```
export DEBUG='ndk:*'
```

or in the browser enable it by writing in the DevTools console

```
localStorage.debug = 'ndk:*'
```

## Support

### NDK NIP-28 group chat

-   note15m6rdfvlmd0z836hk83sg7r59xtv23qnmamhsslq5uc6744fdm4qfkeat3
    -   [Coracle](https://app.coracle.social/chat/note15m6rdfvlmd0z836hk83sg7r59xtv23qnmamhsslq5uc6744fdm4qfkeat3)
    -   [Nostrchat](https://www.nostrchat.io/channel/a6f436a59fdb5e23c757b1e30478742996c54413df777843e0a731af56a96eea)
-   [WIP documentation](https://github.com/nostr-dev-kit/ndk/blob/master/docs/modules.md)

## Features

-   [x] NIP-01
-   [x] Caching adapters
    -   Server-side
        -   [x] [Redis](https://github.com/nostr-dev-kit/ndk-cache-redis)
        -   [ ] In-memory
    -   Client-side
        -   [ ] LocalStorage
        -   [x] IndexedDB ([Dexie](https://github.com/nostr-dev-kit/ndk-cache-dexie))
-   [~] NIP-04: Encryption support
-   [x] NIP-18: Repost
-   [ ] ~~NIP-26~~ Won't add / NIP-26 is dead
-   [ ] NIP-41: Relay authentication
-   [x] NIP-57: Zaps
    -   [x] LUD06
    -   [x] LUD16
-   [x] NIP-65: Contacts' Relay list
-   [x] NIP-89: Application Handlers
-   [x] NIP-90: Data Vending Machines
-   Subscription Management
    -   [x] Auto-grouping queries
    -   [x] Auto-closing subscriptions
-   Signing Adapters
    -   [x] Private key
    -   [x] NIP-07
    -   [!] ~~NIP-26~~ Won't add / NIP-26 is dead
    -   [x] NIP-46
        -   [x] Permission tokens
-   Relay discovery
    -   [x] Outbox-model (NIP-65)
    -   [ ] Implicit relays discovery following pubkey usage
    -   [ ] Implicit relays discovery following `t` tag usage
    -   [x] Explicit relays blacklist
-   [ ] nostr-tools/SimplePool drop-in replacement interface

## Real-world uses of NDK

See [REFERENCES.md](./ndk/REFERENCES.md) for a list of projects using NDK to see how others are using it.

## Instantiate an NDK instance

You can pass an object with several options to a newly created instance of NDK.

-   `explicitRelayUrls` – an array of relay URLs.
-   `signer` - an instance of a [signer](#signers).
-   `cacheAdapter` - an instance of a [Cache Adapter](#caching)
-   `debug` - Debug instance to use for logging. Defaults to `debug("ndk")`.

```ts
// Import the package
import NDK from "@nostr-dev-kit/ndk";

// Create a new NDK instance with explicit relays
const ndk = new NDK({
    explicitRelayUrls: ["wss://a.relay", "wss://another.relay"],
});
```

Note: In normal client use, it's best practice to instantiate NDK as a singleton class. [See more below](#architecture-decisions--suggestions).

## Connecting

After you've instantiated NDK, you need to tell it to connect before you'll be able to interact with any relays.

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

## Signers

NDK uses signers _optionally_ passed in to sign events. Note that it is possible to use NDK without signing events (e.g. [to get someone's profile](https://github.com/nostr-dev-kit/ndk-cli/blob/master/src/commands/profile.ts)).

Signing adapters can be passed in when NDK is instantiated or later during runtime.

### Using a NIP-07 browser extension (e.g. Alby, nos2x)

Instantiate NDK with a NIP-07 signer

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

### Where to look is more important than long-term storage

The most important data to cache is _where_ a user or note might be found. UX suffers profoundly when this type of data cannot be found. By design, the Nostr protocol leaves breadcrumbs of where a user or note might be found and NDK does its best to store this data automatically and use it when you query for events.

### Instantiating and using a cache adapter

```ts
const redisAdapter = new RedisAdapter(redisUrl);
const ndk = new NDK({ cacheAdapter: redisAdapter });
```

## Groupable queries

Clients often need to load data (e.g. profile data) from individual components at once (e.g. initial page render). This typically causes multiple subscriptions to be submitted fetching the same information and causing poor performance or getting rate-limited/maxed out by relays.

NDK implements a convenient subscription model, _buffered queries_, where a named subscription will be created after a customizable amount of time so that multiple components can append queries.

```ts
// Component 1
ndk.subscribe({ kinds: [0], authors: ["pubkey-1"] });

// Component 2
ndk.subscribe({ kinds: [0], authors: ["pubkey-2"] });
```

In this example, NDK will wait 100ms (default `groupableDelay`) before creating a subscription with the filter:

```ts
{kinds: [0], authors: ['pubkey-1', 'pubkey-2'] }
```

## Outbox model (formerly known as _gossip-protocol_)

When instantiating NDK, you can pass a set of outboxRelays, which will be used exclusively to consult outbox-model
related events:

```ts
const ndk = new NDK({
    explicitRelayUrls: ["wss://a.relay", "wss://another.relay"],
    outboxRelayUrls: ["wss://purplepag.es"],
    enableOutboxModel: true,
});
```

When you request information about a user (i.e. explicitly using a user's pubkey in an `authors` filter), NDK will
automatically query the user's outbox relays and subsequent queries will favour using those relays for queries with that
user's pubkey.

[OUTBOX.md](./ndk/OUTBOX.md) contains more information about the outbox model. _WIP_

## Intelligent relay selection

When a client submits a request through NDK, NDK will calculate which relays are most likely able to satisfy this request.

Queries submitted by the client might be broken into different queries if NDK computes different relays.

For example, say npub-A follows npub-B and npub-C. If the NDK client uses:

```ts
const ndk = new NDK({ explicitRelayUrls: ["wss://nos.lol"] });
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
_NDK defaults to having the `closeOnEose` flag set to `true`, to make permanent subscriptions explicit in the codebase; if you want your
subscription to remain active beyond `EOSE`, you should set it to `false`._

-   The `closeOnEose` flag will make the connection close immediately after EOSE is seen.

```ts
ndk.subscribe({ kinds: [0], authors: ["..."] }, { closeOnEose: false });
```

## Convenience methods

NDK implements several convenience methods for common queries.

### Instantiate a user by npub or hex pubkey

This is a handy method for instantiating a new `NDKUser` and associating the current NDK instance with that user for future calls.

```ts
const pablo = ndk.getUser({
    npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
});

const jeff = ndk.getUser({
    pubkey: "1739d937dc8c0c7370aa27585938c119e25c41f6c441a5d34c6d38503e3136ef",
});
```

### Fetch a user's profile and publish updates

You can easily fetch a user's profile data from `kind:0` events on relays. Calling `.fetchProfile()` will update the `profile` attribute on the user object instead of returning the profile directly. NDK then makes it trivial to update values and publish those updates back to relays.

```ts
const pablo = ndk.getUser({
    npub: "npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft",
});
await pablo.fetchProfile();

const pabloFullProfile = pablo.profile;

pablo.profile.name = "Pablo";
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
const ndk = new NDK({ explicitRelayUrls, signer });
const event = new NDKEvent(ndk);
event.kind = 1;
event.content = "PV Nostr! 🤙🏼";
await ndk.publish(event);
```

### Reacting to an event

```ts
// Find the first event from @jack, and react/like it.
const jackHexPubKey = "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2";
const event = await ndk.fetchEvent({ authors: [jackHexPubKey] });
await event.react("🤙");
```

### Zap an event

```ts
// Find the first event from @jack, and zap it.
const jackHexPubKey = "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2";
const event = await ndk.fetchEvent({ authors: [jackHexPubKey] });
await event.zap(1337, "Zapping your post!"); // Returns a bolt11 payment request
```

## Architecture decisions & suggestions

-   Users of NDK should instantiate a single NDK instance.
-   That instance tracks state with all relays connected, explicit and otherwise.
-   All relays are tracked in a single pool that handles connection errors/reconnection logic.
-   RelaySets are assembled ad-hoc as needed depending on the queries set, although some RelaySets might be long-lasting, like the `explicitRelayUrls` specified by the user.
-   RelaySets are always a subset of the pool of all available relays.

## Wall of Contributors

<a href="https://github.com/nostr-dev-kit/ndk/graphs/contributors">
<img src="https://contrib.rocks/image?repo=nostr-dev-kit/ndk" />
</a>
