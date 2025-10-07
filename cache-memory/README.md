# NDK Memory Cache Adapter

A fast in-memory LRU cache adapter for NDK (Nostr Development Kit).

## Features

- **LRU Eviction**: Uses Least Recently Used algorithm to manage memory efficiently
- **Fast Queries**: Synchronous cache lookups with `locking: true`
- **Configurable Size**: Customize maximum cache sizes for events and profiles
- **Complete Implementation**: Supports all NDKCacheAdapter methods including:
  - Event caching and querying
  - Profile management
  - NIP-05 verification caching
  - LNURL document caching
  - Relay status tracking
  - Unpublished event tracking
  - Decrypted event storage
  - Nutzap state management
  - Cashu mint info/keys caching

## Installation

```bash
npm install @nostr-dev-kit/cache-memory
# or
yarn add @nostr-dev-kit/cache-memory
# or
pnpm add @nostr-dev-kit/cache-memory
# or
bun add @nostr-dev-kit/cache-memory
```

## Usage

```typescript
import NDK from "@nostr-dev-kit/ndk";
import NDKMemoryCacheAdapter from "@nostr-dev-kit/cache-memory";

const ndk = new NDK({
    cacheAdapter: new NDKMemoryCacheAdapter({
        maxSize: 5000,        // Max events to cache (default: 5000)
        profileMaxSize: 1000  // Max profiles to cache (default: 1000)
    })
});

await ndk.connect();
```

## Configuration Options

- `maxSize` (optional): Maximum number of events to cache. Default: 5000
- `profileMaxSize` (optional): Maximum number of profiles to cache. Default: 1000

## Performance

This adapter is designed for speed:
- Synchronous queries (no async overhead)
- LRU eviction ensures most frequently accessed data stays in cache
- Efficient memory usage with configurable limits

## When to Use

The memory cache adapter is ideal for:
- Client applications where fast access is critical
- Short-lived sessions
- Applications with predictable memory constraints
- Development and testing

For persistent caching across sessions, consider:
- `@nostr-dev-kit/cache-dexie` (IndexedDB)
- `@nostr-dev-kit/cache-sqlite` (SQLite)

## License

MIT
