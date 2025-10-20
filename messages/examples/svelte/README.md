# NDK Messages Svelte Example with SQLite WASM Cache

This example demonstrates using NDK Messages in a Svelte application with SQLite WASM cache in worker mode.

## Features

- SQLite WASM cache adapter running in a Web Worker
- Persistent caching using IndexedDB
- NDK Messages integration (NIP-17 direct messages)
- ICQ-style messaging UI

## Cache Configuration

The example uses `NDKCacheAdapterSqliteWasm` with worker mode enabled:

```typescript
const cacheAdapter = new NDKCacheAdapterSqliteWasm({
    dbName: "ndk-messages-cache",
    useWorker: true,
    workerUrl: "/worker.js",
    wasmUrl: "/sql-wasm.wasm"
});
```

The cache adapter is automatically initialized on first use. All cache operations (setEvent, query, etc.) wait for initialization to complete before executing.

## Setup

The worker and WASM files need to be in the `public/` directory:
- `public/worker.js` - SQLite worker implementation (1.6 MB)
- `public/sql-wasm.wasm` - SQLite WASM binary (644 KB)

These files are copied from `@nostr-dev-kit/cache-sqlite-wasm/dist/` during setup.

## Running

```bash
# From the project root
bun install

# Build the cache package (if needed)
bun run build --filter=@nostr-dev-kit/cache-sqlite-wasm

# Start dev server
cd messages/examples/svelte
bun run dev
```

The app will be available at http://localhost:5174

## Benefits of Worker Mode

- **Non-blocking**: Database operations run in a separate thread
- **Performance**: Main thread remains responsive during cache operations
- **Persistent**: Data is automatically saved to IndexedDB
- **Efficient**: Debounced writes minimize storage operations
- **Automatic**: Worker initialization happens on first cache operation

## Implementation Details

The cache adapter uses the following pattern:
1. Cache operations call `ensureInitialized()` before executing
2. If worker is not ready, it waits for the initialization promise
3. Once initialized, all operations are dispatched to the worker thread
4. Worker stores data in SQLite WASM and persists to IndexedDB
