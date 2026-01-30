# Web Worker Setup for cache-sqlite-wasm

This guide provides setup instructions for different frameworks.

## Overview

The cache adapter runs SQLite operations in a Web Worker using wa-sqlite with OPFS persistence. This prevents UI freezes and enables incremental database writes.

## Configuration Options

```typescript
const cacheAdapter = new NDKCacheAdapterSqliteWasm({
  dbName: "my-ndk-cache",      // Optional: Database name (default: "ndk-cache")
  workerUrl: "/worker.js",     // Required: Path to the worker script
  metadataLruSize: 1000        // Optional: LRU cache size (default: 1000)
});
```

## Required Server Headers

For OPFS persistence, your server must set these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Without these headers, the cache falls back to in-memory mode.

## Framework Setup

### Next.js

1. **Copy worker to public directory**:

   ```bash
   cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/worker.js public/
   ```

2. **Configure headers** in `next.config.js`:

   ```javascript
   module.exports = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
             { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
           ],
         },
       ];
     },
   };
   ```

3. **Initialize the adapter**:

   ```typescript
   const cacheAdapter = new NDKCacheAdapterSqliteWasm({
     workerUrl: "/worker.js"
   });
   await cacheAdapter.initializeAsync();
   ```

### Vite / SvelteKit

1. **Copy worker to public directory**:

   ```bash
   cp node_modules/@nostr-dev-kit/cache-sqlite-wasm/dist/worker.js public/
   ```

2. **Configure headers** in `vite.config.ts`:

   ```typescript
   export default defineConfig({
     server: {
       headers: {
         'Cross-Origin-Opener-Policy': 'same-origin',
         'Cross-Origin-Embedder-Policy': 'require-corp',
       },
     },
   });
   ```

3. **Initialize the adapter**:

   ```typescript
   const cacheAdapter = new NDKCacheAdapterSqliteWasm({
     workerUrl: "/worker.js"
   });
   await cacheAdapter.initializeAsync();
   ```

### Other Frameworks

1. Copy `dist/worker.js` to your public/static directory
2. Configure your server to send the required COOP/COEP headers
3. Initialize with the correct `workerUrl` path

## Checking Persistence Mode

After initialization, verify OPFS is working:

```typescript
await cacheAdapter.initializeAsync();
const mode = cacheAdapter.getPersistenceMode();

if (mode === 'memory') {
  console.warn('OPFS unavailable - check COOP/COEP headers');
} else {
  console.log('Using OPFS persistence');
}
```

## Troubleshooting

### Worker Fails to Load

- Check browser console for 404 errors
- Verify `workerUrl` path is correct
- Ensure CSP allows worker scripts from your domain

### Always in Memory Mode

- Verify COOP/COEP headers are set (check Network tab)
- Some browsers/contexts don't support OPFS (e.g., iOS Lockdown Mode)
- SharedArrayBuffer must be available (requires secure context + headers)

### Cross-Origin Issues

- Both worker and app must be served from same origin
- If using CDN, ensure CORS headers are correct

## Complete Example

```typescript
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterSqliteWasm from "@nostr-dev-kit/cache-sqlite-wasm";

const cacheAdapter = new NDKCacheAdapterSqliteWasm({
  dbName: "my-app-cache",
  workerUrl: "/worker.js"
});

await cacheAdapter.initializeAsync();

console.log(`Persistence mode: ${cacheAdapter.getPersistenceMode()}`);

const ndk = new NDK({ cacheAdapter });
await ndk.connect();
```
