# Dexie Cache

Meant to be used client-side within a browser context. This is a cache adapter for [Dexie](https://dexie.org/), a wrapper around IndexedDB.

## Usage

NDK will attempt to use the Dexie adapter to store users, events, and tags. The default behaviour is to always check the cache first and then hit relays, replacing older cached events as needed.

## Support

- [x] Events
- [x] User profiles
- [x] Event<>Tag indexes
- [x] NIP-05 lookups
- [x] Unpublished events

### Install

```
pnpm add @nostr-dev-kit/ndk-cache-dexie
```

### Add as a cache adapter

```ts
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";

const dexieAdapter = new NDKCacheAdapterDexie({ dbName: 'your-db-name' });
const ndk = new NDK({cacheAdapter: dexieAdapter, ...other config options});
```

🚨 Because Dexie only exists client-side, this cache adapter will not work in pure node.js environments. You'll need to make sure that you're using the right cache adapter in the right place (e.g. Redis on the backend, Dexie on the frontend).

## Slowness

Because IndexDB is painfully slow, this adapter will primarly act via an LRU cache that periodically flushes to the database. Individual read/writes don't directly hit the database.

## Options

[**NDK Dexie Cache Adapter**](../README.md) • **Docs**

***

[NDK Dexie Cache Adapter](../globals.md) / NDKCacheAdapterDexieOptions

# Interface: NDKCacheAdapterDexieOptions

## Properties

### dbName?

> `optional` **dbName**: `string`

The name of the database to use

#### Defined in

[ndk-cache-dexie/src/index.ts:34](https://github.com/nostr-dev-kit/ndk/blob/26ea669eeeadbc93b894cac1f29829e9a41694cb/ndk-cache-dexie/src/index.ts#L34)

***

### debug?

> `optional` **debug**: `Debugger`

Debug instance to use for logging

#### Defined in

[ndk-cache-dexie/src/index.ts:39](https://github.com/nostr-dev-kit/ndk/blob/26ea669eeeadbc93b894cac1f29829e9a41694cb/ndk-cache-dexie/src/index.ts#L39)

***

### eventCacheSize?

> `optional` **eventCacheSize**: `number`

#### Defined in

[ndk-cache-dexie/src/index.ts:53](https://github.com/nostr-dev-kit/ndk/blob/26ea669eeeadbc93b894cac1f29829e9a41694cb/ndk-cache-dexie/src/index.ts#L53)

***

### eventTagsCacheSize?

> `optional` **eventTagsCacheSize**: `number`

#### Defined in

[ndk-cache-dexie/src/index.ts:54](https://github.com/nostr-dev-kit/ndk/blob/26ea669eeeadbc93b894cac1f29829e9a41694cb/ndk-cache-dexie/src/index.ts#L54)

***

### expirationTime?

> `optional` **expirationTime**: `number`

The number of seconds to store events in Dexie (IndexedDB) before they expire
Defaults to 3600 seconds (1 hour)

#### Defined in

[ndk-cache-dexie/src/index.ts:45](https://github.com/nostr-dev-kit/ndk/blob/26ea669eeeadbc93b894cac1f29829e9a41694cb/ndk-cache-dexie/src/index.ts#L45)

***

### indexableKinds?

> `optional` **indexableKinds**: `number`[] \| `"all"` \| `"none"`

The kinds of events that should be indexed

#### Default

```ts
"all"
```

#### Defined in

[ndk-cache-dexie/src/index.ts:60](https://github.com/nostr-dev-kit/ndk/blob/26ea669eeeadbc93b894cac1f29829e9a41694cb/ndk-cache-dexie/src/index.ts#L60)

***

### nip05CacheSize?

> `optional` **nip05CacheSize**: `number`

#### Defined in

[ndk-cache-dexie/src/index.ts:52](https://github.com/nostr-dev-kit/ndk/blob/26ea669eeeadbc93b894cac1f29829e9a41694cb/ndk-cache-dexie/src/index.ts#L52)

***

### profileCacheSize?

> `optional` **profileCacheSize**: `number`

Number of profiles to keep in an LRU cache

#### Defined in

[ndk-cache-dexie/src/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/26ea669eeeadbc93b894cac1f29829e9a41694cb/ndk-cache-dexie/src/index.ts#L50)

***

### zapperCacheSize?

> `optional` **zapperCacheSize**: `number`

#### Defined in

[ndk-cache-dexie/src/index.ts:51](https://github.com/nostr-dev-kit/ndk/blob/26ea669eeeadbc93b894cac1f29829e9a41694cb/ndk-cache-dexie/src/index.ts#L51)
