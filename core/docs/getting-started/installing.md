# Getting started

## Installation

You can install NDK core using your favorite package manager.

::: code-group

```sh [npm]
npm i @nostr-dev-kit/ndk
```

```sh [pnpm]
pnpm add @nostr-dev-kit/ndk
```

```sh [yarn]
yarn add @nostr-dev-kit/ndk
```

```sh [bun]
bun add @nostr-dev-kit/ndk
```
:::

NDK is compatible with node v16+


## Other packages

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
