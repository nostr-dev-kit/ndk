# Nostr Cache Adapter

NDK cache adapter using a nostr relay as the database.

This cache adapter is meant to be run against a local relay. This adapter will generate two NDK instances:

`ndk` -- This talks exclusively to the local relay, with outbox model disabled.
`fallbackNdk` -- This is used to hydrate the cache and uses the outbox model -- each query the cache receives is placed in a queue in the background so that subsequent requests can be served from the cache. All events from other relays 

## Usage

### Install

```
npm add @nostr-dev-kit/ndk-cache-nostr

```

### Add as a cache adapter

```ts
import NDKCacheAdapterNostr from "@nostr-dev-kit/ndk-cache-nostr";

const cacheAdapter = new NDKCacheAdapterNostr({
    relayUrl: 'ws://localhost:5577',
});
const ndk = new NDK({ cacheAdapter });
```

If running server-side in a NodeJS environment, you should make sure to polyfill `WebSocket`.

# License

MIT
