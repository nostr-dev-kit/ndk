# Memory Cache Adapter

A fast in-memory LRU cache adapter for NDK (Nostr Development Kit).

This cache adapter stores all cached data in memory using a Least Recently Used (LRU) eviction strategy. It's ideal for client applications where fast access is critical and persistent caching across sessions is not required.

## Features

- **LRU Eviction**: Automatically manages memory using Least Recently Used algorithm
- **Fast Queries**: Synchronous cache lookups with no async overhead
- **Configurable Size**: Customize maximum cache sizes for events and profiles
- **Complete Implementation**: Supports all NDKCacheAdapter methods including events, profiles, NIP-05, LNURL, relay status, and more

## Usage

### Install

```bash
npm add @nostr-dev-kit/cache-memory
```

### Add as a cache adapter

```ts
import NDKMemoryCacheAdapter from "@nostr-dev-kit/cache-memory";

const cacheAdapter = new NDKMemoryCacheAdapter({
    maxSize: 5000,        // Max events to cache (default: 5000)
    profileMaxSize: 1000  // Max profiles to cache (default: 1000)
});

const ndk = new NDK({ cacheAdapter });
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
- `@nostr-dev-kit/ndk-cache-dexie` (IndexedDB)
- `@nostr-dev-kit/ndk-cache-sqlite` (SQLite)

# License

MIT
