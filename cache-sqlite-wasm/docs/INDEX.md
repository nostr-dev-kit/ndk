# cache-sqlite-wasm

A SQLite-backed cache adapter for NDK, using wa-sqlite with OPFS for high-performance persistence in browsers.

## Quick Start

```ts
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterSqliteWasm from "@nostr-dev-kit/cache-sqlite-wasm";

// Create the adapter
const cacheAdapter = new NDKCacheAdapterSqliteWasm({
  dbName: "my-ndk-cache",
  workerUrl: "/worker.js"  // Path to the bundled worker
});

// Initialize the adapter
await cacheAdapter.initializeAsync();

// Use with NDK
const ndk = new NDK({ cacheAdapter });
```

## Features

- **OPFS Persistence**: Uses Origin Private File System for incremental writes (only changed pages, not entire database)
- **No Main Thread Blocking**: All SQLite operations run in a Web Worker
- **Automatic Fallback**: Falls back to in-memory mode when OPFS is unavailable
- **Migration**: Automatically cleans up old IndexedDB data from previous sql.js versions

## Required Headers

For OPFS persistence to work, your server must set these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Without these headers, the adapter falls back to in-memory mode (no persistence).

## Check Persistence Mode

```ts
await cacheAdapter.initializeAsync();
const mode = cacheAdapter.getPersistenceMode(); // 'opfs' or 'memory'
console.log(`Cache persistence: ${mode}`);
```

## Configuration Options

```ts
const cacheAdapter = new NDKCacheAdapterSqliteWasm({
  dbName: "my-cache",        // Database name (default: "ndk-cache")
  workerUrl: "/worker.js",   // Path to worker script
  metadataLruSize: 1000      // Max cached profiles/metadata (default: 1000)
});
```

## Migrations

All database migrations are handled automatically on initialization. The adapter also automatically cleans up old IndexedDB data from the previous sql.js-based implementation.

## Advanced Features

- **Decrypted Event Cache**: Store and retrieve decrypted events with `addDecryptedEvent` and `getDecryptedEvent`
- **Unpublished Event Management**: Track events pending publish with `addUnpublishedEvent`, `getUnpublishedEvents`, and `discardUnpublishedEvent`
- **Profile Search**: Search profiles by field with `getProfiles`
- **Cache Stats**: Get cache statistics with `getCacheStats`

## Example Integration

```ts
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterSqliteWasm from "@nostr-dev-kit/cache-sqlite-wasm";

const cacheAdapter = new NDKCacheAdapterSqliteWasm({
  workerUrl: "/worker.js"
});

await cacheAdapter.initializeAsync();

const ndk = new NDK({ cacheAdapter });
await ndk.connect();

// Cache is now active - events will be automatically cached
```

## Troubleshooting

- **Worker fails to load**: Check the network tab for 404s and verify `workerUrl` is correct
- **Always in memory mode**: Verify COOP/COEP headers are set on your server
- **iOS Lockdown Mode**: WASM may not work; the adapter will enter degraded mode gracefully

See [bundling.md](./bundling.md) for build and deployment details.
