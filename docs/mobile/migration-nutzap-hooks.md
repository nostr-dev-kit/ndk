# Migration Guide: Nutzap State & Hooks (vX.Y.Z)

This guide outlines the steps to migrate your application from the previous nutzap state management and hooks implementation (prior to version X.Y.Z) to the new system integrated with the NDK Cache Adapter and `@nostr-dev-kit/ndk-hooks`.

**Key Changes:**

1.  **Nutzap State Persistence:** Nutzap state (`NDKNutzapState`) is no longer persisted via a manually provided `NDKNutzapMonitorStore`. Instead, it relies on the configured `ndk.cacheAdapter` implementing the optional `getAllNutzapStates` and `setNutzapState` methods. The `NDKCacheAdapterSqlite` provided by `ndk-mobile` implements these methods.
2.  **Hook Location:** The React hooks `useSubscribe`, `useNDKWallet`, `useNDKNutzapMonitor`, and `useNDKCurrentUser` have been moved from `@nostr-dev-kit/ndk-mobile` to the more generic `@nostr-dev-kit/ndk-hooks` package.
3.  **Type Location:** The `NDKNutzapState` interface and `NdkNutzapStatus` enum are now defined and exported directly from `@nostr-dev-kit/ndk`.

4.  **Signer Management:** The specific signer implementations (NIP-07, NIP-46, NIP-55) previously included in `@nostr-dev-kit/ndk-mobile` have been removed. Session management, including adding signers for login, should now be handled using the `addSigner` function exported by `@nostr-dev-kit/ndk-hooks`.

**Migration Steps:**

1.  **Update Dependencies:**
    *   Ensure your project depends on the latest versions of `@nostr-dev-kit/ndk`, `@nostr-dev-kit/ndk-wallet`, `@nostr-dev-kit/ndk-hooks`, and `@nostr-dev-kit/ndk-mobile`.
    *   Make sure `@nostr-dev-kit/ndk-hooks` is added as a dependency if it wasn't already.
    *   Run `pnpm install` (or your package manager's equivalent) in the workspace root.

2.  **Update NDK Initialization (If using `NDKCacheAdapterSqlite`):**
    *   Ensure you are initializing `NDKCacheAdapterSqlite` and passing it to your `NDK` instance.
    *   **Important:** After initializing `NDK`, assign the `ndk` instance back to the `cacheAdapter.ndk` property. This allows the adapter's methods (like `getAllNutzapStates`) to access the `NDK` instance if needed (e.g., for deserializing `NDKNutzap` events).

    ```typescript
    // Example NDK setup
    import NDK from "@nostr-dev-kit/ndk";
    import { NDKCacheAdapterSqlite } from "@nostr-dev-kit/ndk-mobile";

    async function initializeNdk() {
        const cacheAdapter = new NDKCacheAdapterSqlite("my-ndk-cache.db");
        await cacheAdapter.initialize(); // Initialize adapter first

        const ndk = new NDK({
            cacheAdapter: cacheAdapter,
            explicitRelayUrls: [/* your relays */],
            // ... other options
        });

        // Assign NDK instance back to adapter *after* NDK initialization
        cacheAdapter.ndk = ndk;

        await ndk.connect();
        return ndk;
    }
    ```

3.  **Update Hook Imports:**
    *   Search your codebase for imports from `@nostr-dev-kit/ndk-mobile` related to these hooks:
        *   `useSubscribe`
        *   `useNDKWallet`
        *   `useNDKNutzapMonitor`
        *   `useNDKCurrentUser`
    *   Change the import path to `@nostr-dev-kit/ndk-hooks`.

5.  **Update `useNDK` Imports (if applicable):**
    *   The `useNDK` hook previously exported by `@nostr-dev-kit/ndk-mobile` was a simple wrapper around the hook from `@nostr-dev-kit/ndk-hooks`. This wrapper has been removed.
    *   If you were importing `useNDK` from a relative path within `ndk-mobile` (e.g., `import { useNDK } from "./ndk"`), update the import to point directly to the main package:

    ```diff
    - import { useNDK } from "./ndk"; // Or other relative path
    + import { useNDK } from "@nostr-dev-kit/ndk-hooks";
    ```

    ```diff
    - import { useSubscribe, useNDKWallet, useNDKNutzapMonitor, useNDKCurrentUser } from "@nostr-dev-kit/ndk-mobile";
    + import { useSubscribe, useNDKWallet, useNDKNutzapMonitor, useNDKCurrentUser } from "@nostr-dev-kit/ndk-hooks";
    ```


5.  **Adapt `useSubscribe` Usage:**
    *   The `useSubscribe` hook in `@nostr-dev-kit/ndk-hooks` has a slightly different return value compared to the version previously in `@nostr-dev-kit/ndk-mobile`.
    *   The `isSubscribed` boolean has been removed. This state was primarily internal and often caused confusion or race conditions in tests. The hook now returns:
        *   `events`: `T[]` - The array of received events.
        *   `eose`: `boolean` - The End of Stored Events flag.
        *   `subscription`: `NDKSubscription | undefined` - A reference to the underlying NDK subscription object.
    *   If you need to know if a subscription is active, you can check if `subscription` is defined.

    ```diff
    - const { events, eose, isSubscribed } = useSubscribe(filters);
    + const { events, eose, subscription } = useSubscribe(filters);

    - if (isSubscribed) {
    + if (subscription) {
          // Subscription is active
      }
    ```



9.  **`useFollows` Hook:**
    *   The `useFollows` hook, which returns the list of followed `NDKUser` objects for the active session, has also been moved from `@nostr-dev-kit/ndk-mobile` to `@nostr-dev-kit/ndk-hooks`.
    *   Update any imports of `useFollows` accordingly.

    ```diff
    - import { useFollows } from "@nostr-dev-kit/ndk-mobile";
    + import { useFollows } from "@nostr-dev-kit/ndk-hooks";
    ```

X.  **Update Signer Usage:**
    *   Remove any code that imports or uses signer-specific functions or classes from `@nostr-dev-kit/ndk-mobile` (e.g., `loginWithNip07`, `NDKNip46Signer`, `NDKNip55Signer`).
    *   Import `addSigner` from `@nostr-dev-kit/ndk-hooks` and use it to add signers to the session.

    ```typescript
    import { addSigner } from "@nostr-dev-kit/ndk-hooks";
    import { NDKNip07Signer } from "@nostr-dev-kit/ndk"; // Or other signer types from NDK core

    // Example: Logging in with NIP-07
    async function login() {
        try {
            const nip07Signer = new NDKNip07Signer();
            // addSigner handles checking if the user exists and setting the active session
            const session = await addSigner(nip07Signer);
            if (session) {
                console.log(`Logged in as ${session.user.npub}`);
            } else {
                console.error("Login failed.");
            }
        } catch (error) {
            console.error("Error during NIP-07 login:", error);
        }
    }
    ```


4.  **Update Type Imports:**
    *   Search for imports of `NDKNutzapState` or `NdkNutzapStatus` from `@nostr-dev-kit/ndk-wallet`.
    *   Change the import path to `@nostr-dev-kit/ndk`.

    ```diff
    - import type { NDKNutzapState } from "@nostr-dev-kit/ndk-wallet";
    - import { NdkNutzapStatus } from "@nostr-dev-kit/ndk-wallet";
    + import type { NDKNutzapState } from "@nostr-dev-kit/ndk";
    + import { NdkNutzapStatus } from "@nostr-dev-kit/ndk";
    ```

6.  **Remove Manual Store Creation:**
    *   If you were previously creating a store object using `createNutzapMonitorStore` (from the old `ndk-mobile/src/db/wallet/nutzap-monitor.ts`), remove this code.
    *   Remove the `store` option when creating `NDKNutzapMonitor` instances manually (though using the `useNDKNutzapMonitor` hook is now the recommended approach). The monitor will automatically use `ndk.cacheAdapter` if available.

    ```diff
    - import { createNutzapMonitorStore } from "./path/to/old/store"; // Remove this import
    - const store = createNutzapMonitorStore(ndk); // Remove this line

      const monitor = new NDKNutzapMonitor(ndk, user, {
          mintList,
    -     store: store, // Remove this option
      });
    ```

7.  **Adapt `useNDKNutzapMonitor` Usage (If needed):**
    *   The hook's signature remains the same (`useNDKNutzapMonitor(mintList?, start?)`).
    *   The hook now handles initialization and starting more automatically based on the availability of `ndk`, `currentUser`, `activeWallet`, and the `start` flag. Review your usage to ensure it aligns with this behavior. See the updated `docs/mobile/nutzaps.md` for an example.

8.  **Database Schema:**
    *   The underlying database table (`nutzap_monitor_state`) used by `NDKCacheAdapterSqlite` remains the same. No database migration is needed for existing nutzap state data *if you were already using the default SQLite implementation*. If you had a custom store, you'll need to adapt your cache adapter implementation.

By following these steps, your application should successfully migrate to the new, more integrated nutzap management system.