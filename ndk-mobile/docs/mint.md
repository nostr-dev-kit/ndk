# Cashu Mint Management in NDK Mobile

NDK Mobile provides support for Cashu mints with persistent storage using SQLite. This allows you to reliably manage and store mint information and keysets for your Cashu-enabled Nostr application.

## Features

- Persistent storage of mint information and keysets in SQLite
- Full CRUD operations for mint data
- Type-safe interfaces

## Mint Information Methods

NDK Mobile extends the `NDKCacheAdapterSqlite` class with mint information management methods:

```typescript
// Get mint information
const mintInfo = ndk.cacheAdapter.getMintInfo("https://example.mint");

// Get mint information with metadata
const mintInfoRecord = ndk.cacheAdapter.getMintInfoRecord("https://example.mint");

// Get all mint information
const allMints = ndk.cacheAdapter.getAllMintInfo();

// Save mint information
ndk.cacheAdapter.setMintInfo("https://example.mint", mintInfoPayload);

// Delete mint information
ndk.cacheAdapter.deleteMintInfo("https://example.mint");
```

## Mint Keyset Methods

NDK Mobile provides methods for managing keysets used by Cashu mints:

```typescript
// Get all keysets for a mint
const keysets = ndk.cacheAdapter.getMintKeys("https://example.mint");

// Get a specific keyset
const keyset = ndk.cacheAdapter.getMintKeyset("https://example.mint", "keyset-id-123");

// Get a keyset with metadata
const keysetRecord = ndk.cacheAdapter.getMintKeysetRecord("https://example.mint", "keyset-id-123");

// Get all keysets for all mints
const allKeysets = ndk.cacheAdapter.getAllMintKeysets();

// Save a keyset
ndk.cacheAdapter.setMintKeys("https://example.mint", "keyset-id-123", keysetData);

// Delete all keysets for a mint
ndk.cacheAdapter.deleteMintKeysets("https://example.mint");

// Delete a specific keyset
ndk.cacheAdapter.deleteMintKeyset("https://example.mint", "keyset-id-123");
```

## Type Definitions

The Cashu mint-related types are defined as follows:

```typescript
/**
 * Response from a mint's info endpoint
 */
interface MintInfoResponse {
    name?: string;
    pubkey?: string;
    version?: string;
    description?: string;
    description_long?: string;
    contact?: string[];
    motd?: string;
    nuts?: string[];
    [key: string]: any;
}

/**
 * Stored mint information including metadata
 */
interface StoredMintInfo {
    url: string;
    payload: MintInfoResponse;
    created_at: number;
    updated_at: number;
}

/**
 * Mint keys structure according to NUT-03
 */
interface MintKeys {
    id: string;
    unit: string;
    keys: Record<string, string>;
    [key: string]: any;
}

/**
 * Stored mint keys including metadata
 */
interface StoredMintKeys {
    url: string;
    keyset_id: string;
    payload: MintKeys;
    created_at: number;
    updated_at: number;
}
```

## Integration with Cashu Libraries

These methods are designed to work with Cashu libraries by providing persistent storage for mint information and keysets. Here's an example of how you might use them with a Cashu client:

```typescript
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import { useNDK } from "@nostr-dev-kit/ndk-mobile";

function useCashuWallet() {
    const { ndk } = useNDK();

    const initMint = async (mintUrl: string) => {
        // Check if we already have info for this mint
        let mintInfo = ndk.cacheAdapter.getMintInfo(mintUrl);

        if (!mintInfo) {
            // Fetch and save mint info
            const mint = new CashuMint(mintUrl);
            mintInfo = await mint.getInfo();
            ndk.cacheAdapter.setMintInfo(mintUrl, mintInfo);
        }

        // Get existing keysets or fetch new ones
        let keysets = ndk.cacheAdapter.getMintKeys(mintUrl);

        if (keysets.length === 0) {
            const mint = new CashuMint(mintUrl);
            const keyset = await mint.getKeys();
            ndk.cacheAdapter.setMintKeys(mintUrl, keyset.id, keyset);
            keysets = [keyset];
        }

        // Initialize wallet with stored mint info and keysets
        const wallet = new CashuWallet(mintUrl, keysets[0]);

        return wallet;
    };

    return { initMint };
}
```
