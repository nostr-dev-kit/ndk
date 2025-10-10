# NDKNutzapMonitor

The `NDKNutzapMonitor` class monitors a user's nutzap inbox for new nutzaps and processes them automatically. It handles the full lifecycle of nutzaps, from discovery to redemption.

## Features

- Monitors relays for nutzaps sent to a specific user
- Automatically redeems nutzaps when the appropriate private key is available
- Keeps track of nutzap states (initial, processing, redeemed, spent, error)
- Persists states across application sessions using the configured NDK Cache Adapter
- Emits events for tracking monitor activity

## Basic Usage

```typescript
import { NDKNutzapMonitor } from "@nostr-dev-kit/ndk-wallet";
import NDK, { NDKUser, NDKPrivateKeySigner, NDKCashuMintList } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet"; // Example wallet

// Assume ndk: NDK, user: NDKUser, mintList?: NDKCashuMintList are initialized
// Assume myCashuWallet: NDKCashuWallet is initialized
// Assume myPrivateKeySigner: NDKPrivateKeySigner is initialized

// Create a monitor for a user
// The store is now automatically derived from ndk.cacheAdapter if available
const monitor = new NDKNutzapMonitor(ndk, user, {
    mintList,
    // No need to pass 'store' manually if using a compatible cache adapter
});

// Set the wallet to use for redeeming nutzaps
monitor.wallet = myCashuWallet;

// If you have extra private keys that might have been used to receive p2pk-locked keys, you can also add them
// this is almost always unnecessary -- the nutzap monitor will try to do this for you if the private keys are
// properly stored as nostr events per the NIP-60 spec.
await monitor.addPrivkey(myPrivateKeySigner);

// Start monitoring for nutzaps
await monitor.start({});

// Listen for events
monitor.on("redeemed", (events, amount) => {
    console.log(`Redeemed ${events.length} nutzaps for ${amount} sats`);
});
```

## State Management

The monitor uses a state machine to track the status of each nutzap. The possible states (`NdkNutzapStatus`) are defined in `@nostr-dev-kit/ndk`:

- `INITIAL`: First time we see a nutzap
- `PROCESSING`: Currently processing the nutzap
- `REDEEMED`: Successfully redeemed
- `SPENT`: The nutzap has already been spent
- `MISSING_PRIVKEY`: No private key available to redeem the nutzap
- `TEMPORARY_ERROR`: A transient error occurred
- `PERMANENT_ERROR`: A permanent error occurred (will not retry)
- `INVALID_NUTZAP`: The nutzap data is invalid

## State Persistence (via Cache Adapter)

The `NDKNutzapMonitor` now leverages the configured `ndk.cacheAdapter` for persisting nutzap states across application sessions.

If the `ndk.cacheAdapter` implements the optional `getAllNutzapStates` and `setNutzapState` methods (as defined in the `NDKCacheAdapter` interface in `@nostr-dev-kit/ndk`), the monitor will automatically use these methods to load initial states and save updates.

### Cache Adapter Interface Methods

The relevant methods in the `NDKCacheAdapter` interface are:

```typescript
// Defined in @nostr-dev-kit/ndk
interface NDKCacheAdapter {
    // ... other methods

    /**
     * Gets all nutzap states from the cache.
     * @returns A map of event IDs to nutzap states.
     */
    getAllNutzapStates?(): Promise<Map<NDKEventId, NDKNutzapState>>;

    /**
     * Sets the state of a nutzap in the cache.
     * @param id The ID of the nutzap event.
     * @param stateChange The partial state change to apply.
     */
    setNutzapState?(id: NDKEventId, stateChange: Partial<NDKNutzapState>): Promise<void>;
}
```

### State Updates

When updating a nutzap's state, the monitor calls `cacheAdapter.setNutzapState` with only the changed properties (`Partial<NDKNutzapState>`), not the entire state object. This allows the cache adapter implementation to efficiently merge updates.

For example:

```typescript
// Internal call within NDKNutzapMonitor
await ndk.cacheAdapter?.setNutzapState?.(nutzapId, {
    status: NdkNutzapStatus.REDEEMED,
    redeemedAmount: 100,
});
```

### Implementing Persistence

If you are creating a custom cache adapter and want it to support nutzap state persistence, you need to implement the `getAllNutzapStates` and `setNutzapState` methods.

NDK Mobile (`@nostr-dev-kit/mobile`) provides an implementation using SQLite via its `NDKCacheAdapterSqlite`. If you use this adapter with your NDK instance, nutzap state persistence will work automatically.

```typescript
// Example: Initializing NDK with the SQLite adapter from ndk-mobile
import NDK from "@nostr-dev-kit/ndk";
import { NDKCacheAdapterSqlite } from "@nostr-dev-kit/mobile";

const cacheAdapter = new NDKCacheAdapterSqlite("my-ndk-cache.db");
await cacheAdapter.initialize(); // Important: Initialize the adapter

const ndk = new NDK({
    cacheAdapter: cacheAdapter,
    // ... other NDK options
});

// Pass the NDK instance to the adapter AFTER NDK is initialized
// This allows the adapter to use the NDK instance if needed (e.g., for deserializing events)
cacheAdapter.ndk = ndk;

// Now, when NDKNutzapMonitor is created with this ndk instance,
// it will use the SQLite adapter for persistence.
```

## Events

The monitor emits several events that you can listen for:

- `seen_in_unknown_mint`: Emitted when a nutzap is seen in a mint not in the user's mint list
- `state_changed`: Emitted when the state of a nutzap changes
- `redeemed`: Emitted when a nutzap is successfully redeemed
- `seen`: Emitted when a new nutzap is seen
- `failed`: Emitted when a nutzap fails to be redeemed

## Managing Private Keys

The monitor needs private keys to redeem nutzaps. Typically, you don't need to do this manually; setting the `monitor.wallet` property should provide the necessary keys if the wallet implementation supports it (like `NDKCashuWallet`).

You can also add extra private keys using:

```typescript
await monitor.addPrivkey(privateKeySigner);
```

You can add multiple private keys, and the monitor will automatically use the appropriate key for each nutzap.

If a nutzap requires a private key that isn't available, it will be marked as `MISSING_PRIVKEY`. If the key is later added, the monitor will automatically attempt to redeem the nutzap.

## Error Handling

The monitor handles various error conditions:

- If a nutzap cannot be redeemed due to a missing private key, it's marked as `MISSING_PRIVKEY`
- If the redemption fails with a transient error, it's marked as `TEMPORARY_ERROR`
- If the redemption fails with a permanent error (e.g., "unknown public key size"), it's marked as `PERMANENT_ERROR`

The monitor will automatically retry nutzaps with temporary errors but not those with permanent errors.
