# Using Nutzaps with NDK Mobile

NDK Mobile integrates with `@nostr-dev-kit/ndk-hooks` to provide React hooks for working with NIP-61 nutzaps, making it easy to monitor and process nutzaps in React Native applications. The persistence of nutzap state is now handled by the configured NDK Cache Adapter.

## Using the useNDKNutzapMonitor Hook

The `useNDKNutzapMonitor` hook, now part of `@nostr-dev-kit/ndk-hooks`, provides a simple way to create and manage a nutzap monitor in React applications. It automatically utilizes the configured `ndk.cacheAdapter` (if it implements the required methods) to persist nutzap state.

```tsx
import {
    useNDKNutzapMonitor, // Import from ndk-hooks
    useNDKCurrentUser,   // Import from ndk-hooks
    useNDK,              // Import from ndk-hooks
    useNDKWallet,        // Import from ndk-hooks
    NDKKind,
    NDKCashuMintList,
} from "@nostr-dev-kit/ndk-hooks"; // Updated package
import { useState, useEffect, useRef } from "react";
import { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet"; // Wallet types remain in ndk-wallet

// Get the active wallet and current user using hooks from ndk-hooks
const { activeWallet } = useNDKWallet();
const currentUser = useNDKCurrentUser();
const { ndk } = useNDK(); // Get NDK instance

// Example: Define your mint list (optional)
const [mintList, setMintList] = useState<NDKCashuMintList | undefined>(undefined);

// Initialize the monitor hook, passing start=true to automatically start it
// when conditions are met (ndk, user, wallet available)
const { nutzapMonitor } = useNDKNutzapMonitor(mintList, true);

useEffect(() => {
    // The useNDKNutzapMonitor hook now handles initialization and starting internally
    // based on the presence of ndk, currentUser, activeWallet, and the 'start' flag.

    // You can still interact with the monitor instance if needed:
    if (nutzapMonitor) {
        nutzapMonitor.on("redeemed", (events, amount) => {
            console.log(`Redeemed ${events.length} nutzaps for ${amount} sats!`);
        });

        nutzapMonitor.on("failed", (event, error) => {
            console.error(`Failed to redeem nutzap ${event.id}: ${error}`);
        });
    }

    // Cleanup listeners if necessary when the component unmounts
    // The hook itself handles stopping the monitor subscription
    return () => {
        nutzapMonitor?.removeAllListeners("redeemed");
        nutzapMonitor?.removeAllListeners("failed");
    };
}, [nutzapMonitor]); // Re-run effect if monitor instance changes

// The hook now manages the monitor lifecycle more automatically.
// Ensure your NDKProvider sets up an NDK instance with a cache adapter
// that supports getAllNutzapStates and setNutzapState for persistence.
// NDKCacheAdapterSqlite in ndk-mobile provides this implementation.
```

**Key Changes:**

*   Hooks (`useNDKNutzapMonitor`, `useNDKWallet`, `useNDKCurrentUser`, `useNDK`) are now imported from `@nostr-dev-kit/ndk-hooks`.
*   The `useNDKNutzapMonitor` hook internally uses the `ndk.cacheAdapter` to load and save nutzap state if the adapter supports the `getAllNutzapStates` and `setNutzapState` methods. You no longer need to manually create a store object.
*   The example demonstrates passing `start=true` to the hook for automatic starting and how to attach event listeners.
