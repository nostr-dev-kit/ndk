# @nostr-dev-kit/cache-browser

Browser-optimized NDK cache adapter with automatic WASM/IndexedDB fallback.

## Features

- **Automatic Fallback**: Tries SQLite WASM first for optimal performance, automatically falls back to IndexedDB (via Dexie) if WASM is unavailable
- **iOS Lockdown Mode Compatible**: Gracefully handles environments where WebAssembly is disabled
- **Performance Optimized**: Remembers which adapter works in localStorage to skip failed attempts on subsequent loads
- **Zero Configuration**: Works out of the box with sensible defaults
- **Transparent**: Drop-in replacement for other NDK cache adapters

## Why?

Some browsers and security modes (like iOS Lockdown Mode) disable WebAssembly for security reasons. The high-performance `@nostr-dev-kit/cache-sqlite-wasm` adapter relies on WASM and won't work in these environments.

This adapter automatically detects when WASM is unavailable and seamlessly falls back to `@nostr-dev-kit/cache-dexie` (IndexedDB-based), ensuring your app works everywhere while using the fastest option available.

## Installation

```bash
npm install @nostr-dev-kit/cache-browser
```

## Usage

### Basic Setup

```typescript
import NDKCacheBrowser from '@nostr-dev-kit/cache-browser';
import NDK from '@nostr-dev-kit/ndk';

const cacheAdapter = new NDKCacheBrowser({
  dbName: 'my-app',
  workerUrl: '/worker.js',      // Path to SQLite WASM worker
  wasmUrl: '/sql-wasm.wasm',    // Path to SQLite WASM binary
});

const ndk = new NDK({
  cacheAdapter,
  // ... other NDK options
});

// Initialize cache before connecting
await cacheAdapter.initializeAsync(ndk);
await ndk.connect();
```

### SvelteKit Example

```typescript
// src/lib/ndk.svelte.ts
import NDKCacheBrowser from '@nostr-dev-kit/cache-browser';
import { createNDK } from '@nostr-dev-kit/svelte';

const cacheAdapter = new NDKCacheBrowser({
  dbName: 'my-app',
  workerUrl: '/worker.js',
  wasmUrl: '/sql-wasm.wasm',
  debug: true
});

export const ndk = createNDK({
  cacheAdapter,
  // ... other options
});

export const cacheInitialized = cacheAdapter.initializeAsync();
```

### Options

```typescript
type NDKCacheBrowserOptions = {
  // Database name (default: 'ndk-cache')
  dbName?: string;

  // Path to SQLite WASM worker script (required for WASM)
  workerUrl?: string;

  // Path to SQLite WASM binary (required for WASM)
  wasmUrl?: string;

  // Enable debug logging (default: false)
  debug?: boolean;

  // Force a specific adapter - useful for testing
  // Skips auto-detection and localStorage persistence
  forceAdapter?: 'wasm' | 'dexie';
};
```

## How It Works

1. **First Load**:
   - Tries to initialize SQLite WASM adapter
   - If WASM fails (e.g., iOS Lockdown Mode), tries Dexie (IndexedDB)
   - Saves successful adapter type to localStorage

2. **Subsequent Loads**:
   - Checks localStorage for previously successful adapter
   - Tries that adapter first to avoid unnecessary initialization attempts
   - Still falls back to the other adapter if the preferred one fails

3. **Degraded Mode**:
   - If both adapters fail, operates without persistent cache
   - App continues to work, just without caching benefits

## Checking Active Adapter

```typescript
// Get the currently active adapter type
const adapterType = cacheAdapter.getAdapterType();
console.log('Using adapter:', adapterType); // 'wasm' | 'dexie' | 'none'

// Get the underlying adapter instance (advanced use)
const adapter = cacheAdapter.getAdapter();
```

## Manual Control

```typescript
import {
  clearPreferredAdapter,
  getPreferredAdapter,
  setPreferredAdapter
} from '@nostr-dev-kit/cache-browser';

// Check current preference
const preferred = getPreferredAdapter(); // 'wasm' | 'dexie' | null

// Clear preference (forces re-detection on next load)
clearPreferredAdapter();

// Manually set preference (not recommended - let auto-detection handle it)
setPreferredAdapter('dexie');
```

## Forcing an Adapter (Testing)

```typescript
// Force WASM adapter only (fail if unavailable)
const wasmOnly = new NDKCacheBrowser({
  dbName: 'test',
  workerUrl: '/worker.js',
  wasmUrl: '/sql-wasm.wasm',
  forceAdapter: 'wasm'
});

// Force Dexie adapter only
const dexieOnly = new NDKCacheBrowser({
  dbName: 'test',
  forceAdapter: 'dexie'
});
```

## Debug Logging

Enable debug logging to see adapter selection and initialization:

```typescript
const cacheAdapter = new NDKCacheBrowser({
  debug: true
});
```

Or set the `DEBUG` environment variable:

```bash
DEBUG=ndk:cache-browser* npm run dev
```

## Migration from Other Adapters

### From @nostr-dev-kit/cache-sqlite-wasm

```diff
- import NDKCacheSqliteWasm from '@nostr-dev-kit/cache-sqlite-wasm';
+ import NDKCacheBrowser from '@nostr-dev-kit/cache-browser';

- const cacheAdapter = new NDKCacheSqliteWasm({
+ const cacheAdapter = new NDKCacheBrowser({
    dbName: 'my-app',
    workerUrl: '/worker.js',
    wasmUrl: '/sql-wasm.wasm',
  });
```

### From @nostr-dev-kit/cache-dexie

```diff
- import NDKCacheDexie from '@nostr-dev-kit/cache-dexie';
+ import NDKCacheBrowser from '@nostr-dev-kit/cache-browser';

- const cacheAdapter = new NDKCacheDexie({
+ const cacheAdapter = new NDKCacheBrowser({
    dbName: 'my-app',
+   workerUrl: '/worker.js',  // Optional - enables WASM upgrade
+   wasmUrl: '/sql-wasm.wasm',
  });
```

## When to Use

- ✅ Browser-based Nostr apps
- ✅ Apps that need iOS Lockdown Mode support
- ✅ Apps that want optimal performance everywhere
- ✅ Progressive Web Apps (PWAs)

**Don't use for:**
- ❌ Node.js applications (use `@nostr-dev-kit/cache-sqlite` instead)
- ❌ Environments where you control the runtime and know WASM works

## Performance

- **WASM mode**: ~10x faster than IndexedDB for complex queries
- **Dexie mode**: Reliable IndexedDB performance, works everywhere
- **localStorage overhead**: < 1ms on subsequent loads

## License

MIT
