# NDK

## Features
- [ ] NIP-01
    - [ ]
- [ ] Caching adapters
    * Server-side
        - [ ] Redis
        - [ ] In-memory
    * Client-side
        - [ ] LocalStorage
        - [ ] IndexDB
- [ ] NIP-26: Event delegation
- [ ] NIP-57: Zaps
- [ ] NIP-65: Contacts' Relay list
* Subscription Management
    - [ ] Buffered queries
    - [ ] Auto-closing subscriptions
- [ ] Signing Adapters
    - [ ] Private key
    - [ ] NIP-07
    - [ ] NIP-26
    - [ ] NIP-46
- [ ] Gossip model
    - [ ] relay discovery via NIP-65
    - [ ] implicit relays discovery following pubkey usage
    - [ ] implicit relays discovery following `t` tag usage
    - [ ] explicit relays blacklist
- [ ] nostr-tools/SimplePool drop-in replacement

## Caching
NDK provides out-of-the-box database-agnostic caching functionality to improve the
performance of applications.

### Cached items
THe most important data to cache is *where* a user or note might be found. UX suffers
profoundly when this type of data cannot be found. The nostr protocol leaves beadcrums
of where a user or note might be.

```ts
const redisAdapter = new RedisAdapter(redisUrl)
const ndk = new NDK({ cacheAdapter: redisAdapter })
```

## Buffered queries
Clients often need to load data (e.g. profile data) from individual components at
once (e.g. initial page render). This typically causes multiple subscriptions to
be submitted fetching the same information and causing poor performance or getting
rate-limited/maxed out by relays.

NDK implements a convenient subscription model, "buffered queries", where a named
subscription will be created after a customizable amount of time, so that multiple
components can append queries and get those queries

## Intelligent relay selection
When a client submits a request through NDK, NDK will calculate which relays are
most likely able to satisfy this request.

Queries submitted by the client might be broken into different queries if NDK
computes different relays.

For example, say user A follows users B and C. If the NDK client uses

```ts
const ndk = new NDK({ explicitRelays: ['wss://nos.lol'] })
const userA = ndk.getUser('userA');
const feedEvents = await userA.feed();
```

This would result in the following request:

```json
{ "kinds": [1], "authors": [ "userB", "userC" ] }
```

But if NDK has observed that `userB` tends to write to `wss://userb.xyz` and
`userC` tends to write to `wss://userc.io` , NDK will send the following queries.

```json
// to userA's explicit relay wss://nos.lol *if* userB and userC have been seen on that relay
{ "kinds": [1], "authors": [ "userB", "userC" ] }

// to wss://userb.xyz
{ "kinds": [1], "authors": [ "userB" ] }

// to wss://userc.io
{ "kinds": [1], "authors": [ "userC" ] }
```




```ts
// Component 1
ndk.bufferedSubscription({ kinds: [0], authors: ['pubkey-1'] }, "profiles", 500);

// Component 2
ndk.bufferedSubscription({ kinds: [0], authors: ['pubkey-2'] }, "profiles", 500);

// after 500ms of the first call, a subscription will be created with filter
// { kinds: [0], authors: [ 'pubkey-1', 'pubkey-2' ]}
```

## Auto-closing subscriptions
Often clients want to fetch data but they don't necessarily need to occupy a connection
to the relay.

The `autoclose` flag will make the connection close immediately after EOSE is received.
An integer `autoclose` will close the connection after that amount of ms after EOSE is received.

```ts
ndk.subscription({kinds:[0], authors:['...']}, { autoclose: true })
```

* NDK class provides the main interface
* enables caller to provide a data storage layer for caching things
* NDK provides nice wrappers for convenient things

```javascript
const ndk = new NDK({ explicitRelays, privateKey });
const pablo = ndk.getProfile('npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft')
```

* Convenience classes provide access to construct events
    ```javascript
    const pablo = ndk.getProfile('npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft')
    pablo.name = 'Pablo';
    await pablo.save();
    ```

### Creating events
```ts
const ndk = new NDK({ explicitRelays })
const event = ndk.event()
event.kind = 0;
event.content = "This is cool, I'm going to autotag @jack@cashapp.com"
await event.publish()
```

### Liking someone else's event
```ts
const event = await ndk.events({ author: 'jack@cashapp.com' })[0]
await event.react('🤙')
```

* Provides access to see status

### Signing Events via NIP-46
```ts
const signingAdapter = new NDK.RemoteSignerAdapter()
const ndk = new NDK({ signingAdapter })
const event = ndk.event()
event.kind = 0;
event.content = "This event is signed via NIP-46."
await event.publish()
```

```ts
const zap =
```


##### Building a profile caching proxy



# Architecture
Users of NDK should instantiate a single NDK instance.

That instance tracks state with all relays connected, explicit and otherwise.

All relays are tracked in a single pool that handles connection errors/reconnection logic.

RelaySets are assembled ad-hoc as needed depending on the queries set, although some
RelaySets might be long-lasting, like the `explicitRelays` specified by the user.