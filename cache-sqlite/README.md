# NDK Cache SQLite

SQLite cache adapter for NDK using better-sqlite3, compatible with Node.js environments.

## Features

- **Node.js Compatible**: Uses better-sqlite3 for native Node.js SQLite support
- **Schema Compatibility**: Uses the same database schema as ndk-cache-sqlite-wasm for easy migration
- **High Performance**: Leverages better-sqlite3's synchronous API for optimal performance
- **Full NDK Integration**: Implements the complete NDKCacheAdapter interface
- **TypeScript Support**: Full TypeScript definitions included

## Installation

```bash
npm install @nostr-dev-kit/ndk-cache-sqlite
# or
yarn add @nostr-dev-kit/ndk-cache-sqlite
# or
bun add @nostr-dev-kit/ndk-cache-sqlite
```

## Usage

```typescript
import NDK from '@nostr-dev-kit/ndk';
import { NDKCacheAdapterSqlite } from '@nostr-dev-kit/ndk-cache-sqlite';

const cache = new NDKCacheAdapterSqlite({
  dbPath: './ndk-cache.db', // Optional: custom database path
  dbName: 'ndk-cache'       // Optional: database name (used if dbPath not provided)
});

const ndk = new NDK({
  cacheAdapter: cache,
  // ... other NDK options
});

// Initialize the cache adapter
await cache.initializeAsync(ndk);
await ndk.connect();
```

## Configuration Options

```typescript
interface NDKCacheAdapterSqliteOptions {
  dbPath?: string;  // Custom path to SQLite database file
  dbName?: string;  // Database name (default: 'ndk-cache')
}
```

## Database Schema

The adapter uses the same schema as ndk-cache-sqlite-wasm:

- `events` - Stores Nostr events
- `profiles` - Stores user profiles
- `decrypted_events` - Stores decrypted events
- `unpublished_events` - Tracks unpublished events
- `event_tags` - Indexes event tags for fast queries
- `relay_status` - Tracks relay connection status
- `nutzap_monitor_state` - Stores nutzap monitoring state

## Compatibility

This package is designed to be a drop-in replacement for ndk-cache-sqlite-wasm in Node.js environments. The database schema is identical, allowing for easy migration between the two adapters.

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build the package
bun run build
```

## License

MIT