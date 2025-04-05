# NDK Mobile Cashu Database Structure

NDK Mobile stores Cashu mint information and keys in SQLite for persistent caching. This document describes how this system works for developers that need to understand or modify this functionality.

## Database Schema

### Mint Information Table

Mint information is stored in the `mint_info` table with the following structure:

```sql
CREATE TABLE IF NOT EXISTS mint_info (
    url TEXT PRIMARY KEY,
    payload TEXT,
    created_at INTEGER,
    updated_at INTEGER
);
```

- `url`: The mint URL, serving as the primary key
- `payload`: JSON string containing the mint information response
- `created_at`: Timestamp when the mint info was first saved (in seconds)
- `updated_at`: Timestamp when the mint info was last updated (in seconds)

### Mint Keys Table

Mint keys are stored in the `mint_keys` table with the following structure:

```sql
CREATE TABLE IF NOT EXISTS mint_keys (
    url TEXT PRIMARY KEY,
    keyset_id TEXT,
    payload TEXT,
    created_at INTEGER,
    updated_at INTEGER
);
```

- `url`: The mint URL
- `keyset_id`: The unique ID of the keyset
- `payload`: JSON string containing the mint keys
- `created_at`: Timestamp when the keys were first saved (in seconds)
- `updated_at`: Timestamp when the keys were last updated (in seconds)

## How Cashu Storage Works

1. When the NDK instance is initialized with a SQLite cache adapter, the Cashu tables are automatically created if they don't exist.

2. The adapter is extended with methods for storing and retrieving mint information and keys:

    ```typescript
    // Mint info methods
    adapter.getMintInfo(url): MintInfoResponse | null
    adapter.getMintInfoRecord(url): StoredMintInfo | null
    adapter.getAllMintInfo(): StoredMintInfo[]
    adapter.setMintInfo(url, info): void
    adapter.deleteMintInfo(url): void

    // Mint keys methods
    adapter.getMintKeys(url): MintKeys[]
    adapter.getMintKeyset(url, keysetId): MintKeys | null
    adapter.getMintKeysetRecord(url, keysetId): StoredMintKeys | null
    adapter.getAllMintKeysets(): StoredMintKeys[]
    adapter.setMintKeys(url, keysetId, keys): void
    adapter.deleteMintKeysets(url): void
    adapter.deleteMintKeyset(url, keysetId): void
    ```

3. The timestamps (`created_at` and `updated_at`) are automatically managed when saving data:
    - When saving a new record, both timestamps are set to the current time
    - When updating an existing record, only `updated_at` is updated

## Working with the Cashu Database

To use the Cashu database functionality:

```typescript
import { NDK } from "@nostr-dev-kit/ndk";
import { NDKCacheAdapterSqlite } from "@nostr-dev-kit/ndk-mobile";
import type { MintInfoResponse, MintKeys } from "@nostr-dev-kit/ndk-mobile";

// Create and initialize the adapter
const adapter = new NDKCacheAdapterSqlite("my-database");
await adapter.initialize();

const ndk = new NDK({
    cacheAdapter: adapter,
    // Other config options
});

// Store mint info
adapter.setMintInfo("https://example-mint.com", {
    name: "Example Mint",
    version: "1.0.0",
    description: "An example mint for testing",
});

// Store mint keys
adapter.setMintKeys("https://example-mint.com", "keyset-123", {
    id: "keyset-123",
    counter: 1,
    // Other key data
});

// Retrieve mint info later
const mintInfo = adapter.getMintInfo("https://example-mint.com");
const keyset = adapter.getMintKeyset("https://example-mint.com", "keyset-123");
```

## Extended SQLite Adapter

The `NDKCacheAdapterSqlite` class is extended with Cashu methods through TypeScript's declaration merging feature. The extension happens when the `initialize()` method of the adapter is called, through the `extendCacheAdapterWithCashu` function.

These methods are automatically added to the adapter when it's initialized.
