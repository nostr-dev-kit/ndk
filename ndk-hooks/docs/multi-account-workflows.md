# Multi-Account Workflows with NDK Hooks

This document outlines common workflows for managing multiple user accounts (sessions) within a React application using the `ndk-hooks` library. It focuses on login, account switching, data fetching, and logout scenarios.

## Core Concepts

*   **NDK Instance:** A single, shared `NDK` instance is managed globally via `useNDKStore` (accessed primarily through `useNDK`).
*   **Session Store:** The `useNDKSessions` store manages data specific to each known user (`pubkey`), including their profile, follows, mute lists, specific replaceable events, and associated `NDKSigner` (if available).
*   **Signers:** Authentication is handled via `NDKSigner` instances (e.g., NIP-07 extension, private key). The `useNDKSessions` store keeps track of available signers. The global `ndk.signer` property is updated when switching users.
*   **Separation of Concerns:**
    *   Store actions (`addSigner`, `removeSigner`, `ensureSession`, `removeSession`, `switchToUser`, `updateSession`, `muteItemForSession`) primarily manipulate the **state** within the `useNDKSessions` store.
    *   **Data fetching** (profiles, follows, mute lists, other events) is generally **not** performed automatically by store actions. It should be triggered reactively in your components using hooks like `useProfile`, `useSubscribe`, or `useObserver` based on changes to the active user or session data.

## 1. Initialization

Before using any session-related hooks, initialize the core NDK instance and dependent stores once in your application setup (e.g., in your root component or context provider).

```tsx
import { NDKProvider, useNDKInit } from 'ndk-hooks'; // Assuming NDKProvider sets up NDK
import NDK from '@nostr-dev-kit/ndk';

// Example NDK setup
const explicitRelayUrls = ['wss://relay.damus.io', 'wss://relay.primal.net'];
const ndkInstance = new NDK({ explicitRelayUrls });
// Add cache adapter, etc.
// ndkInstance.cacheAdapter = new NDKCacheAdapterDexie(...);

function AppInitializer() {
    const initializeNDK = useNDKInit();

    useEffect(() => {
        // Connect NDK instance first
        ndkInstance.connect().then(() => {
            console.log('NDK connected');
            // Initialize stores *after* connection (or based on your app logic)
            initializeNDK(ndkInstance);
        });
    }, [initializeNDK]);

    return null; // Or your app layout
}

function App() {
    return (
        {/* You might have your own NDKProvider or context */}
        <>
            <AppInitializer />
            {/* Rest of your app */}
        </>
    );
}
```

## 2. Logging In / Adding the First Account

Use an `NDKSigner` (e.g., from a NIP-07 extension) and add it using the `addSigner` function obtained from `useNDK`. By default, this will also make the user the active session.

```tsx
import { useNDK } from 'ndk-hooks';
import NDKNip07Signer from '@nostr-dev-kit/ndk-nip07-signer';

function LoginButton() {
    const { addSigner } = useNDK(); // Get addSigner from the core NDK hook

    const handleLogin = async () => {
        try {
            const nip07Signer = new NDKNip07Signer();
            // The user method prompts the NIP-07 extension login
            const user = await nip07Signer.user();
            console.log(`Logged in as ${user.npub}`);

            // Add the signer; this automatically:
            // 1. Ensures a session exists for the user (via ensureSession)
            // 2. Associates the signer with the session
            // 3. Switches to this user (via switchToUser), making them active
            // 4. Updates the global ndk.signer
            await addSigner(nip07Signer); // Defaults to setActive: true

            // NOTE: Data fetching (profile, follows) happens separately (see next step)
        } catch (error) {
            console.error('NIP-07 Login failed:', error);
        }
    };

    return <button onClick={handleLogin}>Login with NIP-07</button>;
}
```

## 3. Fetching User Data (Profile, Follows, Mutes, etc.)

After a user logs in or is switched to, you typically want to fetch their associated data. This is done reactively using hooks that depend on the active user.

```tsx
import { useNDKCurrentUser, useProfile, useSubscribe, NDKKind } from 'ndk-hooks';
import { useEffect } from 'react';

function UserDashboard() {
    const currentUser = useNDKCurrentUser(); // Get the currently active NDKUser object
    const profile = useProfile(currentUser?.pubkey); // Fetch profile for the active user

    // Example: Fetch follows (Kind 3) and mute list (Kind 10000) for the active user
    const { events: contactEvents } = useSubscribe(
        currentUser ? [{ kinds: [NDKKind.Contacts], authors: [currentUser.pubkey], limit: 1 }] : false,
        { closeOnEose: true } // Fetch only once
    );
    const { events: muteEvents } = useSubscribe(
        currentUser ? [{ kinds: [NDKKind.MuteList], authors: [currentUser.pubkey], limit: 1 }] : false,
        { closeOnEose: true } // Fetch only once
    );

    useEffect(() => {
        if (contactEvents.length > 0) {
            console.log('Fetched contact list:', contactEvents[0]);
            // Process the event and update UI or derived state
            // Note: The session store automatically processes Kind 3 and 10000
            // if they are fetched and arrive via its internal subscription (if configured),
            // but fetching them explicitly like this is also common.
        }
    }, [contactEvents]);

     useEffect(() => {
        if (muteEvents.length > 0) {
            console.log('Fetched mute list:', muteEvents[0]);
            // Process the event
        }
    }, [muteEvents]);

    if (!currentUser) {
        return <div>Please log in.</div>;
    }

    return (
        <div>
            <h2>Welcome, {profile?.name || currentUser.npub}</h2>
            {/* Display other data */}
        </div>
    );
}
```

**Key Points:**

*   Use `useNDKCurrentUser` or `useNDKSessions().activeSessionPubkey` as dependencies for your data-fetching hooks (`useProfile`, `useSubscribe`, `useObserver`).
*   When the active user changes, these hooks will re-run with the new `pubkey`, triggering fetches for the new user.
*   The session store itself does *not* automatically fetch this data upon login/switch. Your UI components are responsible for initiating fetches based on the active user.

## 4. Adding Subsequent Accounts

If your application supports multiple simultaneous accounts, add subsequent signers without making them active immediately.

```tsx
import { useNDK } from 'ndk-hooks';
import NDKPrivateKeySigner from '@nostr-dev-kit/ndk-privkey-signer';

function AddAnotherAccountButton() {
    const { addSigner } = useNDK();

    const handleAddAccount = async (nsecOrHexKey: string) => {
        try {
            const pkSigner = NDKPrivateKeySigner.fromString(nsecOrHexKey);
            const user = await pkSigner.user(); // Get user associated with the key

            // Add the signer but DON'T make them active immediately
            await addSigner(pkSigner, false); // setActive: false

            console.log(`Added account: ${user.npub}`);
            // The user can now be switched to later
        } catch (error) {
            console.error('Failed to add account:', error);
        }
    };

    // Example usage:
    // return <button onClick={() => handleAddAccount('nsec...')}>Add Account</button>;
}
```

## 5. Listing Available Accounts

Use the `useAvailableSessions` hook to get a list of pubkeys for which signers are available.

```tsx
import { useAvailableSessions } from 'ndk-hooks';

function AccountSwitcher() {
    const { availablePubkeys } = useAvailableSessions();

    if (availablePubkeys.length === 0) {
        return null; // Or show login button
    }

    return (
        <select onChange={/* Handle switch */}>
            <option>Select Account</option>
            {availablePubkeys.map(pubkey => (
                <option key={pubkey} value={pubkey}>
                    {/* Display npub or profile name */}
                    {pubkey.substring(0, 8)}...
                </option>
            ))}
        </select>
    );
}
```

## 6. Switching Between Accounts

Use the `switchToUser` function from `useNDK` to change the active session.

```tsx
import { useNDK, useAvailableSessions } from 'ndk-hooks';

function AccountSwitcher() {
    const { availablePubkeys } = useAvailableSessions();
    const { switchToUser, currentUser } = useNDK(); // Get switchToUser

    const handleSwitch = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPubkey = event.target.value;
        if (newPubkey) {
            try {
                await switchToUser(newPubkey);
                console.log(`Switched to user ${newPubkey}`);
                // Data fetching for the new user will trigger automatically
                // in components using hooks dependent on currentUser (like UserDashboard)
            } catch (error) {
                console.error('Failed to switch user:', error);
            }
        }
    };

    if (availablePubkeys.length === 0) return null;

    return (
        <select onChange={handleSwitch} value={currentUser?.pubkey || ''}>
            <option value="">Select Account</option>
            {availablePubkeys.map(pubkey => (
                <option key={pubkey} value={pubkey}>
                    {pubkey.substring(0, 8)}...
                </option>
            ))}
        </select>
    );
}
```

## 7. Logging Out / Removing Accounts

You have two main options:

*   **Remove Signer Only (`removeSigner`):** Removes the authentication capability for a user but keeps their session data (profile, follows, etc.) cached in the `useNDKSessions` store. The user becomes "read-only". This is useful if you want to quickly log back in without re-fetching everything.
*   **Remove Session Data (`removeSession`):** Removes the signer *and* all associated data for that user from the `useNDKSessions` store.

```tsx
import { useNDK, useNDKSessions } from 'ndk-hooks';

function LogoutButtons() {
    const { removeSigner, currentUser } = useNDK();
    const { removeSession } = useNDKSessions(); // Get removeSession from the session store hook

    const handleRemoveAuth = async () => {
        if (currentUser?.pubkey) {
            try {
                await removeSigner(currentUser.pubkey);
                console.log('Signer removed, session data kept.');
                // Active user/signer in NDKStore will be cleared.
                // Session store might switch to another available session or null.
            } catch (error) {
                console.error('Failed to remove signer:', error);
            }
        }
    };

    const handleRemoveAllData = () => {
        if (currentUser?.pubkey) {
            // removeSession also implicitly removes the signer association
            // as the session entry is deleted.
            removeSession(currentUser.pubkey);
            console.log('Session data and signer association removed.');
             // Active user/signer in NDKStore might need explicit clearing
             // depending on whether removeSession switched to another user.
             // Often paired with removeSigner for full cleanup.
        }
    };

    if (!currentUser) return null;

    return (
        <>
            <button onClick={handleRemoveAuth}>Logout (Keep Data)</button>
            <button onClick={handleRemoveAllData}>Logout (Remove Data)</button>
        </>
    );
}
```

Choose the method that best suits your application's desired logout behavior. Often, `removeSigner` is sufficient for a standard "logout".