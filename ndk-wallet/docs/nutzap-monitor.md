# NDKNutzapMonitor

The `NDKNutzapMonitor` class monitors a user's nutzap inbox for new nutzaps and processes them automatically. It handles the full lifecycle of nutzaps, from discovery to redemption.

## Features

- Monitors relays for nutzaps sent to a specific user
- Automatically redeems nutzaps when the appropriate private key is available
- Keeps track of nutzap states (initial, processing, redeemed, spent, error)
- Persists states across application sessions using a store
- Emits events for tracking monitor activity

## Basic Usage

```typescript
import { NDKNutzapMonitor } from "@nostr-dev-kit/ndk-wallet";

// Create a monitor for a user
const monitor = new NDKNutzapMonitor(ndk, user, {
    mintList,
    store: myNutzapStore,
});

// Set the wallet to use for redeeming nutzaps
monitor.wallet = myCashuWallet;

// Add a private key that can be used to redeem nutzaps
await monitor.addPrivkey(myPrivateKeySigner);

// Start monitoring for nutzaps
await monitor.start({ filter: {} });

// Listen for events
monitor.on("redeemed", (events, amount) => {
    console.log(`Redeemed ${events.length} nutzaps for ${amount} sats`);
});
```

## State Management

The monitor uses a state machine to track the status of each nutzap. States include:

- `INITIAL`: First time we see a nutzap
- `PROCESSING`: Currently processing the nutzap
- `REDEEMED`: Successfully redeemed
- `SPENT`: The nutzap has already been spent
- `MISSING_PRIVKEY`: No private key available to redeem the nutzap
- `TEMPORARY_ERROR`: A transient error occurred
- `PERMANENT_ERROR`: A permanent error occurred (will not retry)

## State Store

The `NDKNutzapMonitor` can use a state store to persist nutzap states across application sessions. This is optional but recommended for production use.

### Store Interface

The store must implement the `NDKNutzapMonitorStore` interface:

```typescript
interface NDKNutzapMonitorStore {
    getAllNutzaps: () => Promise<Map<NDKEventId, NDKNutzapState>>;
    setNutzapState: (id: NDKEventId, stateChange: Partial<NDKNutzapState>) => Promise<void>;
}
```

### State Updates

When updating a nutzap's state, the monitor calls `setNutzapState` with only the changed properties, not the entire state object. This approach is efficient and allows the store implementation to decide how to merge updates with existing state.

For example, when a nutzap is redeemed, the monitor might update its state with:

```typescript
store.setNutzapState(nutzapId, {
    status: NdkNutzapStatus.REDEEMED,
    redeemedAmount: 100,
});
```

This updates only the `status` and `redeemedAmount` fields, leaving other fields unchanged.

### Implementing a Store

You can implement the store using any storage mechanism (localStorage, IndexedDB, server database, etc.) as long as it conforms to the required interface.

For detailed documentation and examples of implementing a store, see [NDKNutzapMonitor State Store](./nutzap-monitor-state-store.md).

## Events

The monitor emits several events that you can listen for:

- `seen_in_unknown_mint`: Emitted when a nutzap is seen in a mint not in the user's mint list
- `state_changed`: Emitted when the state of a nutzap changes
- `redeemed`: Emitted when a nutzap is successfully redeemed
- `seen`: Emitted when a new nutzap is seen
- `failed`: Emitted when a nutzap fails to be redeemed

## Managing Private Keys

The monitor needs private keys to redeem nutzaps. Typically, you don't need to do this manually, just by setting the wallet parameter it should have all it needs.

You can also add private keys using:

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
