# Session Management & Persistence (NDK Mobile)

`@nostr-dev-kit/ndk-mobile` builds upon the session management provided by `@nostr-dev-kit/ndk-hooks` by adding **persistent storage** for user sessions and signers using `expo-secure-store`. This allows your mobile application to remember logged-in users across restarts.

## Core Concepts Recap

*   **Session State:** Managed by `useNDKSessions` in `ndk-hooks` (in-memory).
*   **Persistence:** Handled by `ndk-mobile` using secure storage.

## Automatic Persistence with `useSessionMonitor`

The easiest way to enable session persistence is by using the `useSessionMonitor` hook provided by `ndk-mobile`.

*   **Purpose:** Automatically loads saved sessions on app startup and saves changes to the active session whenever it's updated in the `useNDKSessions` store.
*   **Usage:** Call this hook once near the root of your application, typically within a component that also initializes NDK (e.g., using `NDKProvider`). It automatically uses the `NDK` instance provided by the context.

```tsx
import React, { useEffect, useState } from 'react';
import NDK from '@nostr-dev-kit/ndk';
import { NDKProvider, useNDKStore } from '@nostr-dev-kit/ndk-hooks';
import { useSessionMonitor, NDKCacheAdapterSqlite } from '@nostr-dev-kit/ndk-mobile';
import { initializeNDK } from '@/lib/ndk'; // Your NDK initialization function

function AppRoot() {
    const { ndk, setNDK } = useNDKStore();

    // Initialize NDK on mount
    useEffect(() => {
        async function bootstrapNDK() {
            if (!ndk) {
                try {
                    // initializeNDK now calls the synchronous bootNDK internally
                    const initializedNdk = await initializeNDK();
                    setNDK(initializedNdk);
                } catch (error) {
                    console.error('Error initializing NDK:', error);
                }
            }
        }
        bootstrapNDK();
    }, [setNDK, ndk]);

    // Start session monitoring once NDK is available
    useSessionMonitor(); // <- Add this hook (no longer needs ndk instance)

    if (!ndk) {
        return <Text>Loading...</Text>; // Or your app's loader
    }

    return (
        <NDKProvider ndk={ndk}>
            {/* Your App Components */}
        </NDKProvider>
    );
}
```

**How it works:**

1.  **On Mount:** `useSessionMonitor` retrieves the `ndk` instance using the `useNDK` hook. It then calls `loadSessionsFromStorage` (asynchronously) to retrieve saved sessions.
2.  It iterates through the stored sessions (most recent first):
    *   Gets the `NDKUser` instance using `ndk.getUser()`.
    *   If a `signerPayload` exists, it calls `ndkSignerFromPayload` (asynchronously) to deserialize the signer.
    *   Calls `initSession` (from `ndk-hooks`) for each user, passing the `ndk` instance, `user`, optional `signer`, and setting `autoSetActive` for the first session. This populates the `useNDKSessions` store.
3.  **On Active Session Change:** The hook subscribes to changes in `useNDKSessions.activeSessionPubkey`. When the active session changes:
    *   It retrieves the full active session data using `getActiveSession()`.
    *   It accesses the `signer` directly from the session data.
    *   It serializes the signer using `signer.toPayload()`.
    *   It calls `addOrUpdateStoredSession` (asynchronously) to save the `pubkey`, serialized `signerPayload`, and update the `lastActive` timestamp in secure storage.
4.  **On Session Removal:** The hook monitors the `sessions` map from `useNDKSessions`. When a session is detected as removed (comparing current vs. previous state), it calls `removeStoredSession` (asynchronously) to delete the session from secure storage.

## Synchronous Bootstrapping with `bootNDK`

For scenarios where you need to **synchronously** initialize the `NDK` instance with the last active user *before* the React component tree mounts (e.g., setting up background tasks, avoiding initial flashes of logged-out state), `ndk-mobile` provides the synchronous `bootNDK` function.

*   **Purpose:** To **synchronously** pre-populate `ndk.activeUser` directly on the `NDK` instance using the most recently active session found in storage.
*   **Limitation:** Due to the synchronous nature and the asynchronous requirement for signer deserialization (`ndkSignerFromPayload`), `bootNDK` **cannot** set `ndk.signer`. Signer restoration is handled asynchronously by `useSessionMonitor` later.
*   **Usage:** Call this function within your NDK initialization logic, *after* creating the `NDK` instance but *before* connecting or passing it to the `NDKProvider`.

```typescript
// Example: apps/mobile/lib/ndk.ts
import NDK, {
    NDKCacheAdapterSqlite,
    bootNDK // Import bootNDK
} from '@nostr-dev-kit/ndk-mobile';
// ... other imports

export async function initializeNDK() { // Function remains async due to connect()
    const cacheAdapter = new NDKCacheAdapterSqlite('olas');
    await cacheAdapter.initialize();

    const ndk = new NDK({
        cacheAdapter,
        explicitRelayUrls: [/*...*/],
        // ... other options
    });
    cacheAdapter.ndk = ndk; // Assign NDK back to adapter

    // Synchronously boot NDK with the most recently active user from storage
    bootNDK(ndk); // <- Call synchronous bootNDK here (no await)

    // Connect *after* setting the active user
    await ndk.connect();

    return ndk;
}
```

**How it works:**

1.  Calls `loadSessionsFromStorageSync` (synchronously).
2.  Takes the first session (most recent).
3.  Sets `ndk.activeUser` using `ndk.getUser()`.
4.  Logs whether a signer payload was found but confirms it will be loaded asynchronously later by `useSessionMonitor`.

**Note:** `bootNDK` directly modifies the `ndk` instance synchronously. `useSessionMonitor` will later run and asynchronously re-hydrate the `useNDKSessions` store and load the signer based on the same storage data, ensuring consistency between the initial `ndk` state and the React state.

## Signer Serialization

`ndk-mobile` relies on the signer serialization mechanism defined in `ndk-core`:

*   **`signer.toPayload(): string`:** Each signer (`NDKPrivateKeySigner`, `NDKNip07Signer`, `NDKNip46Signer`, `NDKNip55Signer`) implements this method to return a JSON string containing its type and necessary data for reconstruction.
*   **`ndkSignerFromPayload(payloadString: string, ndk?: NDK): Promise<NDKSigner | undefined>`:** An asynchronous function in `ndk-core` that takes the payload string, parses the type, looks up the corresponding signer class in a registry, and calls its static `fromPayload` method.
*   **`SignerClass.fromPayload(payloadString: string, ndk?: NDK): Promise<SignerClass>`:** Each signer class implements this static asynchronous method to reconstruct an instance from its serialized payload string.
*   **`signerRegistry: Map<string, NDKSignerStatic<NDKSigner>>`:** A map in `ndk-core` where signer types register themselves (e.g., `signerRegistry.set("nip55", NDKNip55Signer)`). This allows `ndkSignerFromPayload` to find the correct class for deserialization.

`ndk-mobile` uses `toPayload` (via `useSessionMonitor`) to save the active signer and `ndkSignerFromPayload` (via `useSessionMonitor`) to restore it asynchronously. `bootNDK` uses synchronous storage access but cannot restore the signer itself.
