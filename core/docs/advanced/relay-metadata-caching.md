# Relay Metadata Caching

NDK provides a flexible relay metadata and statistics caching system that allows both core functionality and packages to store and retrieve relay-specific information persistently.

## Overview

The relay metadata system supports:
- **Connection tracking** - Track connection successes, failures, and backoff timing
- **NIP-11 caching** - Cache relay information documents to avoid repeated network requests
- **Package-specific metadata** - Any NDK package can store custom relay metadata using namespacing

## Data Structure

```typescript
type NDKCacheRelayInfo = {
    // Connection tracking
    lastConnectedAt?: number;
    dontConnectBefore?: number;
    consecutiveFailures?: number;
    lastFailureAt?: number;

    // Cached NIP-11 data
    nip11?: {
        data: NDKRelayInformation;
        fetchedAt: number;
    };

    // Package-specific metadata (namespaced)
    metadata?: Record<string, Record<string, unknown>>;
};
```

## Core Features

### NIP-11 Caching

Relay information is automatically cached for 24 hours when using `relay.fetchInfo()`:

```typescript
// First call fetches from network
const info = await relay.fetchInfo();
console.log(`Relay: ${info.name}`);

// Second call uses cache (within 24 hours)
const info2 = await relay.fetchInfo(); // Fast! Uses cache

// Force fresh fetch
const freshInfo = await relay.fetchInfo(true);
```

### Connection Tracking

Track relay connection statistics:

```typescript
await cacheAdapter.updateRelayStatus(relayUrl, {
    lastConnectedAt: Date.now(),
    consecutiveFailures: 0
});

// On failure
await cacheAdapter.updateRelayStatus(relayUrl, {
    consecutiveFailures: (status?.consecutiveFailures || 0) + 1,
    lastFailureAt: Date.now()
});

// Implement backoff
const backoffMs = Math.min(300000, 1000 * Math.pow(2, consecutiveFailures));
await cacheAdapter.updateRelayStatus(relayUrl, {
    dontConnectBefore: Date.now() + backoffMs
});
```

## Package-Specific Metadata

Any NDK package can store custom metadata using the `metadata` field with namespacing:

### Example: Sync Package

The `@nostr-dev-kit/sync` package stores Negentropy support information:

```typescript
// Store capability
await cacheAdapter.updateRelayStatus(relayUrl, {
    metadata: {
        sync: {
            supportsNegentropy: false,
            lastChecked: Date.now(),
            lastError: "bad msg"
        }
    }
});

// Read capability
const status = await cacheAdapter.getRelayStatus(relayUrl);
const syncMeta = status?.metadata?.sync;
if (syncMeta?.supportsNegentropy === false) {
    // Skip negentropy, use fallback
}
```

### Example: Custom Package

```typescript
// Auth package tracking relay authentication
await cacheAdapter.updateRelayStatus(relayUrl, {
    metadata: {
        auth: {
            token: 'AUTH_TOKEN_HERE',
            expiresAt: Date.now() + 3600000,
            lastAuthAt: Date.now()
        }
    }
});

// Rate limiting package tracking request counts
await cacheAdapter.updateRelayStatus(relayUrl, {
    metadata: {
        rateLimit: {
            requestCount: 42,
            windowStart: Date.now(),
            maxPerWindow: 100,
            resetAt: Date.now() + 60000
        }
    }
});

// Multiple packages can coexist
const status = await cacheAdapter.getRelayStatus(relayUrl);
console.log(status?.metadata?.sync);      // Sync package metadata
console.log(status?.metadata?.auth);      // Auth package metadata
console.log(status?.metadata?.rateLimit); // Rate limit package metadata
```

## Metadata Merging

When updating relay status, metadata is automatically merged:

```typescript
// First update
await cacheAdapter.updateRelayStatus(relayUrl, {
    metadata: {
        sync: { supportsNegentropy: false }
    }
});

// Second update - merges with existing
await cacheAdapter.updateRelayStatus(relayUrl, {
    metadata: {
        auth: { token: 'TOKEN', expiresAt: Date.now() }
    }
});

// Result has both
const status = await cacheAdapter.getRelayStatus(relayUrl);
// status.metadata.sync = { supportsNegentropy: false }
// status.metadata.auth = { token: 'TOKEN', expiresAt: ... }
```

Note: Within the same namespace, updates replace the entire namespace object:

```typescript
await cacheAdapter.updateRelayStatus(relayUrl, {
    metadata: {
        sync: { supportsNegentropy: false, lastChecked: 1000 }
    }
});

// This replaces the entire sync namespace
await cacheAdapter.updateRelayStatus(relayUrl, {
    metadata: {
        sync: { lastError: "error" }
    }
});

// Result: metadata.sync = { lastError: "error" } only
```

## Cache Adapter Support

All NDK cache adapters support relay metadata:

- ✅ `cache-memory` - In-memory (lost on restart)
- ✅ `cache-dexie` - IndexedDB (browser persistent)
- ✅ `cache-sqlite` - SQLite (Node.js persistent)
- ✅ `cache-sqlite-wasm` - SQLite WASM (browser persistent)
- ⚠️  `cache-redis` - Not yet implemented
- ⚠️  `cache-nostr` - Not yet implemented

## Best Practices

### Namespacing

Always use your package name as the namespace key:

```typescript
// Good
metadata: {
    'my-package': { ... }
}

// Bad - conflicts possible
metadata: {
    data: { ... }
}
```

### TTLs

Consider adding timestamp-based TTLs for your metadata:

```typescript
const metadata = status?.metadata?.['my-package'];
const MAX_AGE = 3600000; // 1 hour

if (metadata && Date.now() - (metadata.lastChecked as number) < MAX_AGE) {
    // Use cached data
} else {
    // Refresh
}
```

### Error Handling

Store error information for debugging:

```typescript
try {
    await somethingThatMightFail();
} catch (error) {
    await cacheAdapter.updateRelayStatus(relayUrl, {
        metadata: {
            'my-package': {
                lastError: error instanceof Error ? error.message : 'Unknown error',
                lastErrorAt: Date.now()
            }
        }
    });
}
```

## Examples

See `sync/examples/relay-metadata-demo.ts` for a complete working example demonstrating:
- NIP-11 caching
- Negentropy capability caching
- Custom package metadata
- Full relay status inspection

## Migration Notes

For packages previously using in-memory caching (like sync v1.x):

**Before:**
```typescript
private relayCapabilities = new Map<string, RelayCapability>();
```

**After:**
```typescript
// Use persistent cache
const status = await ndk.cacheAdapter?.getRelayStatus(relayUrl);
const metadata = status?.metadata?.['your-package'];
```

Benefits:
- Persists across application restarts
- Shared infrastructure with other packages
- Automatically works with all cache adapters
