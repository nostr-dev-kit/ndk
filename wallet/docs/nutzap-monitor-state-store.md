# NDKNutzapMonitor State Store

The NDKNutzapMonitor uses a state store to persist the status of nutzaps across application sessions. This allows the monitor to track which nutzaps have been redeemed, which have failed, and which are still pending.

## NDKNutzapMonitorStore Interface

The `NDKNutzapMonitorStore` interface defines the required methods for a state store:

```typescript
export interface NDKNutzapMonitorStore {
    /**
     * Get all nutzaps that the monitor knows about.
     */
    getAllNutzaps: () => Promise<Map<NDKEventId, NDKNutzapState>>;

    /**
     * Update the state of a nutzap.
     */
    setNutzapState: (id: NDKEventId, stateChange: Partial<NDKNutzapState>) => Promise<void>;
}
```

## State Store Usage

### State Retrieval

When the NDKNutzapMonitor starts, it loads all existing nutzap states from the store:

```typescript
// Inside the monitor's start method
if (this.store) {
    const nutzaps = await this.store.getAllNutzaps();
    for (const [id, state] of nutzaps.entries()) {
        this.nutzapStates.set(id, state);
    }
}
```

### State Updates

As the monitor processes nutzaps, it updates their states incrementally using `setNutzapState`. Each update includes only the properties that have changed, not the entire state object:

```typescript
// When updating a nutzap state
this.store?.setNutzapState(id, { status: NdkNutzapStatus.REDEEMED, redeemedAmount: 100 });
```

This partial update approach is efficient and allows the store implementation to decide how to merge updates with existing state.

## State Object Structure

The `NDKNutzapState` object contains the following properties:

```typescript
export interface NDKNutzapState {
    // The nutzap event itself (optional)
    nutzap?: NDKNutzap;

    // Current status of the nutzap
    status: NdkNutzapStatus;

    // The token event id of the event that redeemed the nutzap (optional)
    redeemedById?: NDKEventId;

    // Error message if the nutzap has an error (optional)
    errorMessage?: string;

    // Amount redeemed if the nutzap has been redeemed (optional)
    redeemedAmount?: number;
}
```

## Implementing a Custom Store

When implementing your own store, you need to handle both methods:

1. `getAllNutzaps()`: Should return a Map of all nutzap states by event ID
2. `setNutzapState()`: Should update specific properties of a nutzap state

Your implementation can use any storage mechanism (local storage, IndexedDB, server, etc.) as long as it conforms to this interface.

## Example Implementation

Here's a simple example using browser's localStorage:

```typescript
class LocalStorageNutzapStore implements NDKNutzapMonitorStore {
    private storageKey = "ndk_nutzap_states";

    async getAllNutzaps(): Promise<Map<NDKEventId, NDKNutzapState>> {
        const states = new Map<NDKEventId, NDKNutzapState>();
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                for (const [id, state] of Object.entries(parsed)) {
                    states.set(id, state as NDKNutzapState);
                }
            }
        } catch (e) {
            console.error("Failed to load nutzap states", e);
        }
        return states;
    }

    async setNutzapState(id: NDKEventId, stateChange: Partial<NDKNutzapState>): Promise<void> {
        try {
            const stored = localStorage.getItem(this.storageKey) || "{}";
            const parsed = JSON.parse(stored);
            parsed[id] = { ...parsed[id], ...stateChange };
            localStorage.setItem(this.storageKey, JSON.stringify(parsed));
        } catch (e) {
            console.error("Failed to save nutzap state", e);
        }
    }
}
```

This is just a simple example. In a real application, you might want to use a more robust storage solution and handle serialization of complex objects properly.
