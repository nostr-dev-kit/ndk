# Session Management & Persistence (NDK Mobile)

`@nostr-dev-kit/ndk-mobile` builds upon the session management provided by `@nostr-dev-kit/ndk-hooks` by adding **persistent storage** for user sessions and signers using `expo-secure-store`. This allows your mobile application to remember logged-in users across restarts.

## Core Concepts Recap

*   **Session State:** Managed by `useNDKSessions` in `ndk-hooks` (in-memory).
*   **Persistence:** Handled by `ndk-mobile` using secure storage.

## Automatic Persistence with `useSessionMonitor`

The easiest way to enable session persistence is by using the `useSessionMonitor` hook provided by `ndk-mobile`.

*   **Purpose:** Automatically loads saved sessions on app startup and saves changes to the active session whenever it's updated in the `useNDKSessions` store.
*   **Usage:** Call this hook once near the root of your application, typically within a component that also initializes NDK (e.g., using `NDKProvider`). It automatically uses the `NDK` instance provided by the context. You can optionally pass `SessionInitOptions` to customize how sessions are initialized when loaded from storage.

```tsx
import React, { useEffect, useState } from 'react';
import NDK from '@nostr-dev-kit/ndk';
import { NDKProvider, useNDKStore } from '@nostr-dev-kit/ndk-mobile';
import { useSessionMonitor, NDKCacheAdapterSqlite, bootNDK } from '@nostr-dev-kit/ndk-mobile';

const cacheAdapter = new NDKCacheAdapterSqlite('your-app');
cacheAdapter.initialize();

function initializeNDK() {
    const opts: Record<string, unknown> = {}; // Use a more specific type than any

    const ndk = new NDK({
        cacheAdapter,
        explicitRelayUrls: [ /* your default relays */ ],
        clientName: 'your-app',
    });

    // Boot NDK with the most logged-in accounts that ndk-mobile saves for you
    bootNDK(ndk); // Call synchronous boot function

    ndk.connect();

    return ndk;
}

const ndk = initializeNDK();

function AppRoot() {
    const { setNDK } = useNDKStore();

    useEffect(() => setNDK(ndk), []);
    // Optionally pass options to control how restored sessions are initialized
    useSessionMonitor({
        // Example: Don't automatically fetch profiles for restored sessions
        // profile: false,
        // follows: false,
        // muteList: false,
    });

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
    *   Calls `initSession` (from `ndk-hooks`) for each user, passing the `ndk` instance, `user`, optional `signer`, and merging any provided `sessionInitOptions` with the default `autoSetActive: isFirst` logic. This populates the `useNDKSessions` store.
3.  **On Active Session Change:** The hook subscribes to changes in `useNDKSessions.activeSessionPubkey`. When the active session changes:
    *   It retrieves the full active session data using `getActiveSession()`.
    *   It accesses the `signer` directly from the session data.
    *   It serializes the signer using `signer.toPayload()`.
    *   It calls `addOrUpdateStoredSession` (asynchronously) to save the `pubkey`, serialized `signerPayload`, and update the `lastActive` timestamp in secure storage.
4.  **On Session Removal:** The hook monitors the `sessions` map from `useNDKSessions`. When a session is detected as removed (comparing current vs. previous state), it calls `removeStoredSession` (asynchronously) to delete the session from secure storage.


## Logging In / Starting a New Session

This is the standard method for logging a user into your application and establishing their active session. It's typically performed after a successful login event, such as obtaining credentials via NIP-07, NIP-46 (Nostr Connect), or directly using a private key.
This involves:

1.  **Getting the `NDKUser`:** Obtain the `NDKUser` object for the logged-in user, usually via `ndk.getUser({ npub })` or `ndk.getUser({ hexpubkey })`.
2.  **Getting the `NDKSigner`:** Obtain the appropriate `NDKSigner` instance (e.g., `Nip07Signer`, `Nip46Signer`, `PrivateKeySigner`).
3.  **Calling `initSession`:** Use the `initSession` function exported from `@nostr-dev-kit/ndk-hooks` (and re-exported by `ndk-mobile`) to add the user and signer to the session store.

```tsx
import { useNDK } from "@nostr-dev-kit/ndk-hooks";
import { useNDKSessions } from "@nostr-dev-kit/ndk-hooks";
import { NDKUser, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import React from 'react';

// Assume you have obtained the user's private key after login
const userPrivateKey = "nsec..."; // Replace with actual private key logic

function LoginButton() {
    const { ndk } = useNDK();
    const { initSession, setActiveSession } = useNDKSessions();

    const handleLogin = async () => {
        if (!ndk || !userPrivateKey) return;

        try {
            // 1. Create the signer
            const signer = new NDKPrivateKeySigner(userPrivateKey);

            // 2. Get the NDKUser associated with the signer
            const user: NDKUser = await signer.user();
            await user.fetchProfile(); // Optional: Fetch profile details

            // 3. Initialize the session in the store
            //    - Pass ndk, user, and signer.
            //    - Set autoSetActive to true if you want this to be the main session immediately.
            initSession(ndk, user, signer, true);

            // Alternatively, if you initSession with autoSetActive: false,
            // you can activate it later:
            // setActiveSession(user.pubkey);

            console.log(`Session initialized for user: ${user.npub}`);

            // If useSessionMonitor is active, this session will now be persisted.

        } catch (error) {
            console.error("Failed to initialize session:", error);
            // Handle login error
        }
    };

    return <button onClick={handleLogin}>Login with Private Key</button>;
}
```

**Important Notes:**

*   If you are using `useSessionMonitor`, calling `initSession` will trigger the monitor to persist the newly added session automatically.
*   Ensure you handle signer creation securely, especially when dealing with private keys.
*   The `ndk` instance must be available when calling `initSession`. Make sure your component is within the `NDKProvider` context or has access to the initialized `NDK` instance.
