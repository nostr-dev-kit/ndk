# ndk-cache-dexie

NDK cache adapter for [Dexie](https://dexie.org/). Dexie is a wrapper around IndexedDB, an in-browser database.

## Usage

NDK will attempt to use the Dexie adapter to store users, events, and tags. The default behaviour is to always check the cache first and then hit relays, replacing older cached events as needed.

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

# License

MIT
