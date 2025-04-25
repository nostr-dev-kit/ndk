# ndk-cache-sqlite-wasm

A SQLite-backed cache adapter for NDK, running in the browser or any JS environment with WASM support.

## Quick Start

```ts
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterSqliteWasm from "@nostr-dev-kit/ndk-cache-sqlite-wasm";

// Create the adapter (optionally specify dbName)
const cacheAdapter = new NDKCacheAdapterSqliteWasm({ dbName: "my-ndk-cache" });

// Initialize the adapter (loads WASM, runs migrations)
await cacheAdapter.initialize();

// Use with NDK
const ndk = new NDK({ cacheAdapter });
```

Or, if you already have an NDK instance:

```ts
ndk.cacheAdapter = new NDKCacheAdapterSqliteWasm({ dbName: "my-ndk-cache" });
await ndk.cacheAdapter.initialize();
```

## WASM Loading

**No manual WASM loading required.**  
The adapter automatically loads and initializes the SQLite WASM module internally when you call `initialize()`. You do not need to import or fetch the WASM file yourself; the adapter handles all setup, including:

- Fetching and instantiating the WASM binary
- Initializing the database
- Running all required migrations

If you need to customize the WASM binary path (for example, if you are self-hosting or using a CDN), you can pass a `wasmUrl` option:

```ts
const cacheAdapter = new NDKCacheAdapterSqliteWasm({
  dbName: "my-ndk-cache",
  wasmUrl: "/path/to/sqlite.wasm"
});
await cacheAdapter.initialize();
```

## Migrations

All database migrations are handled automatically on initialization, mirroring the schema and logic of the NDK mobile SQLite adapter. You do not need to run any manual migration steps.

## Synchronous and Asynchronous APIs

The adapter provides both synchronous and asynchronous methods, matching the NDKCacheAdapter interface. Use whichever fits your application's needs.

## Advanced Features

- **Decrypted Event Cache:**  
  Supports storing and retrieving decrypted events with `addDecryptedEvent` and `getDecryptedEvent`, just like the ndk-mobile SQLite adapter.

- **Unpublished Event Management:**  
  Supports adding, retrieving, and discarding unpublished events with `addUnpublishedEvent`, `getUnpublishedEvents`, and `discardUnpublishedEvent`.

- **Automatic Persistence:**  
  The database is automatically persisted to IndexedDB 1000ms after the last write, so your data survives page reloads without manual intervention.

- **Full Parity with ndk-mobile:**  
  Implements all core and advanced cache methods, including relay status, profile, and event management.

## Minimal Setup

- No manual WASM loading or DB setup required.
- No need to manage migrations.
- No need to manually save the database—persistence is automatic.
- Just instantiate, initialize, and use.

## Troubleshooting

- If you encounter issues with WASM loading (e.g., due to CSP or hosting), ensure the `wasmUrl` is accessible from your app.
- For advanced debugging, enable verbose logging via the adapter's options.

## Example: Full Integration

```ts
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterSqliteWasm from "@nostr-dev-kit/ndk-cache-sqlite-wasm";

const cacheAdapter = new NDKCacheAdapterSqliteWasm();
await cacheAdapter.initialize();

const ndk = new NDK({ cacheAdapter });
// ...use NDK as usual