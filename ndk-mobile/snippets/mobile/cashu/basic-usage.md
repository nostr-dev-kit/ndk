# NDK Mobile Cashu Management - Basic Usage

The NDK Mobile SQLite cache adapter includes built-in methods for storing and retrieving Cashu mint information and keys directly from the database.

## Initialization

The Cashu functionality is automatically initialized when you create an NDK instance with a SQLite cache adapter:

```typescript
import { NDK } from "@nostr-dev-kit/ndk";
import { NDKCacheAdapterSqlite } from "@nostr-dev-kit/ndk-mobile";

// Create and initialize the NDK instance with SQLite adapter
const adapter = new NDKCacheAdapterSqlite("my-database");
await adapter.initialize();

const ndk = new NDK({
    cacheAdapter: adapter,
    // other options
});

// The Cashu tables are created automatically during adapter initialization via migrations
```

## Managing Mint Information

Access Cashu functions directly through the adapter instance:

```typescript
import { NDKCacheAdapterSqlite } from "@nostr-dev-kit/ndk-mobile";
import type { MintInfoResponse } from "@nostr-dev-kit/ndk-mobile";

// Get the SQLite adapter from your NDK instance
const adapter = ndk.cacheAdapter as NDKCacheAdapterSqlite;

// Save mint information
const mintInfo: MintInfoResponse = {
    name: "Example Mint",
    version: "1.0.0",
    description: "An example Cashu mint",
    pubkey: "mint-pubkey-123",
};
adapter.setMintInfo("https://example-mint.com", mintInfo);

// Get mint information
const storedMintInfo = adapter.getMintInfo("https://example-mint.com");
if (storedMintInfo) {
    console.log("Mint name:", storedMintInfo.name);
    console.log("Mint description:", storedMintInfo.description);
}

// Get mint information with metadata (creation/update timestamps)
const mintInfoRecord = adapter.getMintInfoRecord("https://example-mint.com");
if (mintInfoRecord) {
    console.log("Created at:", new Date(mintInfoRecord.created_at * 1000).toLocaleString());
    console.log("Updated at:", new Date(mintInfoRecord.updated_at * 1000).toLocaleString());
}

// Get all stored mint information
const allMints = adapter.getAllMintInfo();
console.log(`Stored ${allMints.length} mints`);

// Delete mint information
adapter.deleteMintInfo("https://example-mint.com");
```

## Managing Mint Keys

```typescript
import { NDKCacheAdapterSqlite } from "@nostr-dev-kit/ndk-mobile";
import type { MintKeys } from "@nostr-dev-kit/ndk-mobile";

// Get the SQLite adapter from your NDK instance
const adapter = ndk.cacheAdapter as NDKCacheAdapterSqlite;

// Save mint keys
const mintKeys: MintKeys = {
    id: "keyset-123",
    counter: 1,
    "1": { id: "key1" },
    "2": { id: "key2" },
};
adapter.setMintKeys("https://example-mint.com", "keyset-123", mintKeys);

// Get all keysets for a mint
const allKeys = adapter.getMintKeys("https://example-mint.com");
console.log(`Found ${allKeys.length} keysets`);

// Get a specific keyset
const keyset = adapter.getMintKeyset("https://example-mint.com", "keyset-123");
if (keyset) {
    console.log("Keyset ID:", keyset.id);
    console.log("Counter:", keyset.counter);
}

// Get a specific keyset with metadata
const keysetRecord = adapter.getMintKeysetRecord("https://example-mint.com", "keyset-123");
if (keysetRecord) {
    console.log("Created at:", new Date(keysetRecord.created_at * 1000).toLocaleString());
    console.log("Updated at:", new Date(keysetRecord.updated_at * 1000).toLocaleString());
}

// Get all keysets for all mints
const allKeysets = adapter.getAllMintKeysets();
console.log(`Found ${allKeysets.length} keysets across all mints`);

// Delete a specific keyset
adapter.deleteMintKeyset("https://example-mint.com", "keyset-123");

// Delete all keysets for a mint
adapter.deleteMintKeysets("https://example-mint.com");
```

## In React Components

When using with React, you'll need to manage the state yourself:

```tsx
import React, { useState, useEffect } from "react";
import { NDKCacheAdapterSqlite } from "@nostr-dev-kit/ndk-mobile";
import type { MintInfoResponse } from "@nostr-dev-kit/ndk-mobile";

function MintInfoComponent({ adapter, url }: { adapter: NDKCacheAdapterSqlite; url: string }) {
    const [mintInfo, setMintInfo] = useState<MintInfoResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load mint info when component mounts
        const info = adapter.getMintInfo(url);
        setMintInfo(info);
        setLoading(false);
    }, [adapter, url]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!mintInfo) {
        return <div>No information available for this mint</div>;
    }

    return (
        <div>
            <h1>{mintInfo.name || "Unknown Mint"}</h1>
            <p>{mintInfo.description}</p>
            <p>Version: {mintInfo.version}</p>
        </div>
    );
}
```
