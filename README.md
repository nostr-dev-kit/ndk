# NDK

<img src="https://raw.githubusercontent.com/nvk/ndk.fyi/master/ndk.svg" alt="drawing" width="200"/>

![Tests](https://github.com/nostr-dev-kit/ndk/actions/workflows/deploy.yml/badge.svg)

NDK is a [nostr](<[url](https://github.com/nostr-protocol/nostr)>) development kit that makes the experience of building Nostr-related applications, whether they are relays, clients, or anything in between, better, more reliable and overall nicer to work with than existing solutions.

## Features

### NIPs support

- [x] NIP-01
- [x] NIP-04: Encryption support
- [x] NIP-07: Browser extension signer adapter
- [x] NIP-17: Gift-wrap DMs
- [x] NIP-18: Repost + Generic Reposts
- [x] NIP-22: Generic Comments
- [x] NIP-23: Long-form event wrapper + validation
- [x] NIP-29: Simple group event wrappers + validation
- [x] NIP-42: Relay authentication
- [x] NIP-44: Encryption support
- [x] NIP-46: Remote signing
    - [x] Permission tokens
    - [x] OAuth flow
- [x] NIP-47: Nostr Wallet Connect
- [x] NIP-57: Zaps
    - [x] LUD06
    - [x] LUD16
- [x] NIP-59: Gift wraps
- [x] NIP-60: Nutsack wallet
- [x] NIP-61: Nutzaps
- [x] NIP-65: Contacts' Relay list
- [x] NIP-89: Application Handlers
- [x] NIP-90: Data Vending Machines

### Other stuff

- [x] Caching adapters

    - Server-side
        - [x] [Redis](https://github.com/nostr-dev-kit/ndk/tree/master/ndk-cache-redis)
    - Client-side
        - [x] IndexDB ([Dexie](https://github.com/nostr-dev-kit/ndk/tree/master/ndk-cache-dexie))
        - [x] [SQLite on Mobile](https://github.com/nostr-dev-kit/ndk/tree/master/ndk-mobile)
        - [x] [SQLite WASM on Web Workers](https://github.com/nostr-dev-kit/ndk/tree/master/ndk-cache-sqlite-wasm)))

- Subscription Management
    - [x] Auto-grouping queries
    - [x] Auto-closing subscriptions
    - [x] Reactive subscriptions
- Signing Adapters
    - Private key
    - Browser extension
    - nsecBunker
- Relay discovery
    - [x] Outbox-model (NIP-65)
    - [ ] Implicit relays discovery following pubkey usage
    - [ ] Implicit relays discovery following `t` tag usage
    - [x] Explicit relays blacklist

## Documentation

See [NDK Documentation](https://nostr-dev-kit.github.io/ndk/getting-started/introduction.html) for documentation on how to use NDK.

## Real-world uses of NDK

See [REFERENCES.md](./REFERENCES.md) for a list of projects using NDK to see how others are using it.
