# NDK (Nostr Development Kit)

NDK is a TypeScript/JavaScript library that simplifies building Nostr clients, relays, and related applications.

> [!WARNING]
> The documentation of the NDK project is under heavy construction.
> [More information available in open pull request](https://github.com/nostr-dev-kit/ndk/pull/344).

## Features

- Event creation, validation, and wrappers for [major NIPs](#nip-support)
- Flexible subscription API with caching, batching, and auto-closing
- Event Signing through private key, encrypted
  keys ([NIP-49](https://github.com/nostr-protocol/nips/blob/master/49.md)),
  browser extension ([NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md)) or remote signer
  ([NIP-46](https://github.com/nostr-protocol/nips/blob/master/46.md))
- Relay connection pool with automatic reconnection and failover
- Outbox model support
- Pluggable cache adapters (Redis, Dexie, SQLite, etc)
- Data Vending Machine support ([NIP-90](https://github.com/nostr-protocol/nips/blob/master/90.md))
- Zap
  utilities ([NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md), [NIP-61](https://github.com/nostr-protocol/nips/blob/master/61.md))
- Threading, event kinds, and utility functions (URL normalization, metadata tags, filters)
- Modular design with packages for different frameworks (Mobile, Svelte, React)

### NIP Support

- [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md)
- [NIP-04](https://github.com/nostr-protocol/nips/blob/master/04.md)
- [NIP-07](https://github.com/nostr-protocol/nips/blob/master/07.md)
- [NIP-18](https://github.com/nostr-protocol/nips/blob/master/18.md)
- [NIP-49](https://github.com/nostr-protocol/nips/blob/master/49.md)
- [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md)
- [NIP-60](https://github.com/nostr-protocol/nips/blob/master/60.md)
- [NIP-61](https://github.com/nostr-protocol/nips/blob/master/61.md)

## Multi-Repo

NDK is a monorepo with different packages. The main package is `@nostr-dev-kit/core` and contains the core
functionality.

For other functionality you might need additional packages:

### Extras

* [@nostr-dev-kit/blossom](/blossom/README.md): Blossom Protocol Support for assets
* [@nostr-dev-kit/sessions](/sessions/README.md): Session Management with Multi-Account support
* [@nostr-dev-kit/sync](/sync/README.md): Event synchronization using Negentropy
* [@nostr-dev-kit/wallet](/wallet/README.md): Support for WebLN, NWC, Cashu/eCash wallets
* [@nostr-dev-kit/wot](/wot/README.md): Web of Trust (WOT) utilities

### Framework Integrations

* [@nostr-dev-kit/react](/react/README.md): Hooks and utilities to integrate Nostr into your React applications
* [@nostr-dev-kit/svelte](/svelte/README.md): Modern, performant, and beautiful Svelte 5 integration

### Cache Adapters

These NDK adapters are used to store and retrieve data from a cache so relays do not need to be
re-queried for the same data.

* [@nostr-dev-kit/cache-memory](/cache-memory/README.md): In-memory LRU cache adapter
* [@nostr-dev-kit/cache-nostr](/cache-nostr/README.md): Local Nostr relay cache adapter
* [@nostr-dev-kit/cache-redis](/cache-redis/README.md): A cache adapter for Redis
* [@nostr-dev-kit/cache-dexie](/cache-dexie/README.md): Dexie (IndexedDB, in browser database) adapter
* [@nostr-dev-kit/cache-sqlite](/cache-sqlite/README.md): SQLite (better-sqlite3) adapter
* [@nostr-dev-kit/cache-sqlite-wasm](/cache-sqlite-wasm/md): In browser (WASM) SQLite adapter
