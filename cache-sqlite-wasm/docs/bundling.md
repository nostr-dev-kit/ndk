# Bundling and Runtime Setup for Web Worker

This guide explains how the build process is configured to support the Web Worker for the NDK Cache SQLite WASM adapter.

## Build Output

The build process produces:

- `dist/worker.js`: The bundled Web Worker script, built from `src/worker.ts` as an ES module for browser use.
- `dist/wa-sqlite.wasm`: The wa-sqlite WASM binary (sync version).
- `dist/wa-sqlite-async.wasm`: The wa-sqlite WASM binary (async version, used by default).

The worker script must be accessible to your application at runtime. The WASM files are loaded automatically by the wa-sqlite library.

## Referencing the Worker at Runtime

When initializing the adapter, you only need to provide the URL for the worker file:

```typescript
import { NDKCacheAdapterSqliteWasm } from '@nostr-dev-kit/cache-sqlite-wasm';

const adapter = new NDKCacheAdapterSqliteWasm({
  workerUrl: '/dist/worker.js', // Adjust path as served by your web server
  dbName: 'my-app-cache'        // Optional: customize database name
});
```

- `workerUrl`: The URL to the worker script. This should point to the built `worker.js` file as served by your web server.
- `dbName`: Optional database name (default: `ndk-cache`). Used for the OPFS path.

## Persistence Mode

The adapter automatically selects the best persistence mode:

1. **OPFS** (Origin Private File System) - Primary: Best performance with incremental writes
2. **In-memory** - Fallback: Used when OPFS is unavailable

Check the persistence mode at runtime:

```typescript
await adapter.initializeAsync();
const mode = adapter.getPersistenceMode(); // 'opfs' or 'memory'
```

## Required Headers for OPFS

For OPFS persistence to work, your server must set these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Without these headers, the adapter falls back to in-memory mode.

## Serving the Files

Ensure your web server serves `dist/worker.js` at the URL you provide to the adapter.

For local development, copy or symlink the worker file into your public directory, or configure your server to serve from `dist/`.

## Troubleshooting

- If the worker fails to load, check the network tab for 404s and verify the `workerUrl` is correct.
- If persistence isn't working (always in-memory mode), verify the COOP/COEP headers are set.
- For framework-specific setups (Vite, Next.js, SvelteKit), see the postinstall output for guidance.
