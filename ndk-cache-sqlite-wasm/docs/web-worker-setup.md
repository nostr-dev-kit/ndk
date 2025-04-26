# Web Worker Setup for ndk-cache-sqlite-wasm

This guide provides detailed instructions for setting up and configuring the Web Worker mode in the `ndk-cache-sqlite-wasm` adapter across different frameworks and environments.

## Overview

The Web Worker mode allows SQLite operations to run in a background thread, preventing UI freezes during heavy database operations. This is particularly useful for applications that perform frequent or complex database operations.

## Configuration Options

When initializing the adapter with Web Worker mode, you need to provide these options:

```typescript
const cacheAdapter = new NDKCacheAdapterSqliteWasm({
  dbName: "my-ndk-cache",        // Optional: Database name (default: "ndk-cache")
  useWorker: true,               // Required: Enable Web Worker mode
  workerUrl: "/dist/worker.js",  // Required: Path to the worker script
  wasmUrl: "/dist/sql-wasm.wasm" // Required: Path to the WASM file
});
```

### Options Explained

- `useWorker`: Set to `true` to enable Web Worker mode.
- `workerUrl`: The URL to the worker script (`worker.js`). This must be accessible from your application.
- `wasmUrl`: The URL to the WASM file (`sql-wasm.wasm`). This must be accessible from the worker's context.

## Breaking Changes

When using Web Worker mode, there are some important breaking changes to be aware of:

1. **All database operations become asynchronous**:
   - All methods that interact with the database return Promises and must be awaited.
   - This is a fundamental requirement of Web Worker communication.

2. **Synchronous methods throw errors in worker mode**:
   - `fetchProfileSync` and `getAllProfilesSync` will throw an error if called when `useWorker: true`.
   - You must use their asynchronous counterparts (`fetchProfile` and a query-based approach for getting all profiles).

Example of handling the breaking changes:

```typescript
// Before (synchronous):
const profile = cacheAdapter.fetchProfileSync(pubkey);

// After (with Web Worker mode):
const profile = await cacheAdapter.fetchProfile(pubkey);
```

## Setup for Different Frameworks

### Next.js Setup

1. **Copy the required files to your public directory**:

   ```bash
   cp node_modules/@nostr-dev-kit/ndk-cache-sqlite-wasm/dist/worker.js public/
   cp node_modules/@nostr-dev-kit/ndk-cache-sqlite-wasm/dist/sql-wasm.wasm public/
   ```

2. **Configure the adapter**:

   ```typescript
   import NDKCacheAdapterSqliteWasm from "@nostr-dev-kit/ndk-cache-sqlite-wasm";

   const cacheAdapter = new NDKCacheAdapterSqliteWasm({
     useWorker: true,
     workerUrl: "/worker.js",        // Served from public directory
     wasmUrl: "/sql-wasm.wasm"       // Served from public directory
   });
   ```

3. **Add to your CSP if needed**:

   If you're using a Content Security Policy, ensure it allows:
   - Worker scripts from your domain
   - WASM execution

### Vite Setup

1. **Copy the required files to your public directory**:

   ```bash
   cp node_modules/@nostr-dev-kit/ndk-cache-sqlite-wasm/dist/worker.js public/
   cp node_modules/@nostr-dev-kit/ndk-cache-sqlite-wasm/dist/sql-wasm.wasm public/
   ```

2. **Configure the adapter**:

   ```typescript
   import NDKCacheAdapterSqliteWasm from "@nostr-dev-kit/ndk-cache-sqlite-wasm";

   const cacheAdapter = new NDKCacheAdapterSqliteWasm({
     useWorker: true,
     workerUrl: "/worker.js",
     wasmUrl: "/sql-wasm.wasm"
   });
   ```

3. **Alternative: Use import.meta.url (Vite-specific)**:

   Vite supports URL resolution with `import.meta.url`, but this approach may not work in all environments:

   ```typescript
   // Import the files to ensure they're included in the build
   import workerUrl from "@nostr-dev-kit/ndk-cache-sqlite-wasm/dist/worker.js?url";
   import wasmUrl from "@nostr-dev-kit/ndk-cache-sqlite-wasm/dist/sql-wasm.wasm?url";

   const cacheAdapter = new NDKCacheAdapterSqliteWasm({
     useWorker: true,
     workerUrl,
     wasmUrl
   });
   ```

### Other Frameworks

For other frameworks, the general approach is:

1. **Make the worker and WASM files accessible via HTTP**:
   - Copy them to your public/static directory, or
   - Configure your bundler to include them in the build output

2. **Provide the correct URLs to the adapter**:
   - The URLs should be relative to your application's base URL
   - Both files must be accessible from the browser

## Troubleshooting

### Worker Fails to Load

If the worker fails to initialize:

1. Check the browser console for errors
2. Verify that the `workerUrl` is correct and the file is accessible
3. Ensure your CSP (if any) allows worker scripts

### WASM File Not Found

If the WASM file fails to load within the worker:

1. Check the browser console for errors from the worker
2. Verify that the `wasmUrl` is correct and the file is accessible from the worker's context
3. Try using an absolute URL for the WASM file (e.g., `https://your-domain.com/sql-wasm.wasm`)

### Cross-Origin Issues

If you encounter cross-origin issues:

1. Ensure both files are served from the same origin as your application
2. Check that your server sends the correct CORS headers if serving from a different origin

## Performance Considerations

- The Web Worker mode adds a small overhead for message passing between threads
- For very small, infrequent database operations, this overhead might outweigh the benefits
- For complex queries or bulk operations, the performance improvement can be significant

## Example: Complete Integration

```typescript
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterSqliteWasm from "@nostr-dev-kit/ndk-cache-sqlite-wasm";

// Initialize the adapter with Web Worker mode
const cacheAdapter = new NDKCacheAdapterSqliteWasm({
  dbName: "my-ndk-cache",
  useWorker: true,
  workerUrl: "/worker.js",
  wasmUrl: "/sql-wasm.wasm"
});

// Initialize the adapter (this will set up the worker)
await cacheAdapter.initialize();

// Use with NDK
const ndk = new NDK({ cacheAdapter });

// All database operations are now async
await ndk.connect();

// Example: Fetch a profile (must use async version)
const profile = await cacheAdapter.fetchProfile(pubkey);