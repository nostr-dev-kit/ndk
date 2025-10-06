# ndk-cache-redis

NDK cache adapter for redis.

This cache is mostly a skeleton; the cache hit logic is very basic and only checks if
a query is using precisely `kinds` and `authors` filtering.

## Usage

### Install

```
npm add @nostr-dev-kit/ndk-cache-redis
```

### Add as a cache adapter

```ts
import NDKRedisCacheAdapter from "@nostr-dev-kit/ndk-cache-redis";

const cacheAdapter = new NDKRedisCacheAdapter();
const ndk = new NDK({ cacheAdapter });
```

# License

MIT
