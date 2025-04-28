# NDK Mobile Cashu Management - Advanced Usage

## Direct Database Access

You can access the Cashu database functionality directly through the NDK cache adapter:

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

// Get mint info directly from the database
const mintInfo = adapter.getMintInfo("https://example-mint.com");

// Save mint info to the database
adapter.setMintInfo("https://example-mint.com", {
    name: "Example Mint",
    version: "1.0.0",
    description: "An example mint for testing",
});

// Get mint keys from the database
const mintKeys = adapter.getMintKeys("https://example-mint.com");

// Save mint keys to the database
adapter.setMintKeys("https://example-mint.com", "keyset-123", {
    id: "keyset-123",
    counter: 1,
    // Other key data
});

// Delete mint data from the database
adapter.deleteMintInfo("https://example-mint.com");
adapter.deleteMintKeyset("https://example-mint.com", "keyset-123");
adapter.deleteMintKeysets("https://example-mint.com"); // Delete all keysets
```

## Custom Fetching and Storing

You can implement custom fetch logic and store the results directly:

```typescript
import { NDKCacheAdapterSqlite } from "@nostr-dev-kit/ndk-mobile";
import type { MintInfoResponse, MintKeys } from "@nostr-dev-kit/ndk-mobile";

// Create a custom fetcher for mint info
async function fetchAndStoreMintInfo(
    adapter: NDKCacheAdapterSqlite,
    url: string
): Promise<MintInfoResponse | null> {
    try {
        // Custom fetch logic, e.g., with authentication or different endpoints
        const response = await fetch(`${url}/custom-info-endpoint`, {
            headers: { Authorization: "Bearer token" },
        });

        if (!response.ok) return null;
        const mintInfo = await response.json();

        // Store the fetched data in the database
        adapter.setMintInfo(url, mintInfo);

        return mintInfo;
    } catch (e) {
        console.error("Failed to fetch mint info:", e);
        return null;
    }
}

// Usage example
const adapter = ndk.cacheAdapter as NDKCacheAdapterSqlite;
const mintInfo = await fetchAndStoreMintInfo(adapter, "https://example-mint.com");
```

## Working with Multiple Keysets

Managing multiple keysets for a mint:

```typescript
import { NDKCacheAdapterSqlite } from '@nostr-dev-kit/ndk-mobile';
import type { MintKeys } from '@nostr-dev-kit/ndk-mobile';

/**
 * Find the newest keyset for a mint based on counter value
 */
function getNewestKeyset(adapter: NDKCacheAdapterSqlite, url: string): MintKeys | null {
    // Get all keysets
    const keysets = adapter.getMintKeys(url);

    if (keysets.length === 0) return null;

    // Sort keysets by counter (highest first)
    const sortedKeysets = [...keysets].sort((a, b) =>
        (b.counter || 0) - (a.counter || 0)
    );

    // Return the keyset with the highest counter
    return sortedKeysets[0];
}

/**
 * Store multiple keysets for a mint
 */
function storeKeysets(
    adapter: NDKCacheAdapterSqlite,
    url: string,
    keysets: MintKeys[]
): void {
    // Store each keyset
    for (const keyset of keysets) {
        if (!keyset.id) {
            console.error('Keyset is missing ID', keyset);
            continue;
        }

        adapter.setMintKeys(url, keyset.id, keyset);
    }
}

// Example in React component
function KeysetSelector({ adapter, url }: { adapter: NDKCacheAdapterSqlite, url: string }) {
    const [keysets, setKeysets] = React.useState<MintKeys[]>([]);
    const [selectedKeyset, setSelectedKeyset] = React.useState<MintKeys | null>(null);

    React.useEffect(() => {
        // Load keysets when component mounts
        const mintKeysets = adapter.getMintKeys(url);
        setKeysets(mintKeysets);

        // Select the newest keyset by default
        if (mintKeysets.length > 0) {
            const newest = getNewestKeyset(adapter, url);
            setSelectedKeyset(newest);
        }
    }, [adapter, url]);

    return (
        <div>
            <h2>Available Keysets ({keysets.length})</h2>
            <select
                value={selectedKeyset?.id || ''}
                onChange={(e) => {
                    const selected = keysets.find(k => k.id === e.target.value);
                    setSelectedKeyset(selected || null);
                }}
            >
                <option value="">Select a keyset</option>
                {keysets.map(keyset => (
                    <option key={keyset.id} value={keyset.id}>
                        {keyset.id} {keyset.counter ? `(Counter: ${keyset.counter})` : ''}
                    </option>
                ))}
            </select>

            {selectedKeyset && (
                <div>
                    <h3>Selected Keyset: {selectedKeyset.id}</h3>
                    <pre>{JSON.stringify(selectedKeyset, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
```
