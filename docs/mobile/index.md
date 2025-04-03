# NDK Mobile

A React Native/Expo implementation of [NDK (Nostr Development Kit)](https://github.com/nostr-dev-kit/ndk) that provides a complete toolkit for building Nostr applications on mobile platforms.

## Features

-   🔐 Multiple signer implementations supported via NDK Core (NIP-07, NIP-46, Private Key) and NDK Mobile (NIP-55).
-   💾 SQLite-based caching for offline support (`NDKCacheAdapterSqlite`).
-   🔄 Subscription management with automatic reconnection.
-   📱 React Native and Expo compatibility.
-   🪝 React hooks for easy state management (`useNDKStore`, `useNDKSessions`, `useSubscribe`, etc. via `@nostr-dev-kit/ndk-hooks`).
-   👛 Integrated wallet support (via `@nostr-dev-kit/ndk-wallet`).
-   🔄 **Persistent Sessions:** Automatically saves and loads user sessions and signers using `expo-secure-store`.

## Installation

```sh
# Install NDK Core, Hooks, Wallet, and Mobile
npm install @nostr-dev-kit/ndk @nostr-dev-kit/ndk-hooks @nostr-dev-kit/ndk-wallet @nostr-dev-kit/ndk-mobile expo-secure-store react-native-get-random-values @bacons/text-decoder expo-sqlite expo-crypto expo-file-system
# Ensure peer dependencies for expo-sqlite are met
npm install expo-sqlite/next
```
*Note: Ensure all necessary peer dependencies for Expo modules like `expo-sqlite` are installed.*

## Usage

When using this library, you primarily interact with the core `NDK` instance and hooks from `@nostr-dev-kit/ndk-hooks`. `ndk-mobile` provides the `NDKCacheAdapterSqlite` for persistence, the `useSessionMonitor` hook for automatic session persistence, the `bootNDK` function for initialization, and the NIP-55 signer.

### Initialization

Initialize NDK using a dedicated function (e.g., `initializeNDK`) that sets up the cache adapter and calls `bootNDK`. Use this function within your app's root component and provide the instance via `NDKProvider`. Use the `useSessionMonitor` hook to enable automatic persistence.

```typescript
// Example: lib/ndk.ts
import NDK, {
    NDKCacheAdapterSqlite,
    bootNDK // Import bootNDK
} from '@nostr-dev-kit/ndk-mobile';
import { Platform } from 'react-native'; // Needed for cache adapter path

// Define the database name
const DB_NAME = 'ndk-cache.db';

export async function initializeNDK() {
    // Use platform-specific path if needed, or adjust as necessary
    const dbPath = Platform.OS === 'web' ? DB_NAME : undefined;
    const cacheAdapter = new NDKCacheAdapterSqlite(dbPath || DB_NAME);
    await cacheAdapter.initialize();

    const ndk = new NDK({
        cacheAdapter,
        explicitRelayUrls: [/* your default relays */],
        // ... other NDK options
    });
    cacheAdapter.ndk = ndk; // Assign NDK back to adapter

    // Boot NDK with the most recently active user from storage
    await bootNDK(ndk);

    // Connect *after* potentially setting the active user/signer
    // Use a timeout if needed to prevent blocking UI
    await ndk.connect(5000); // Example 5-second timeout

    return ndk;
}
```

```tsx
// Example: App.tsx (or your root component)
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { NDKProvider, useNDKStore } from '@nostr-dev-kit/ndk-hooks';
import { useSessionMonitor } from '@nostr-dev-kit/ndk-mobile';
import { initializeNDK } from './lib/ndk'; // Adjust path as needed
import LoginScreen from './components/LoginScreen'; // Your component

function App() {
    const { ndk, setNDK } = useNDKStore();

    // Initialize NDK on mount
    useEffect(() => {
        async function bootstrapNDK() {
            if (!ndk) { // Prevent re-initialization
                try {
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
    useSessionMonitor(ndk);

    if (!ndk) {
        return <Text>Loading NDK...</Text>; // Or your app's loader
    }

    // Wrap your app with NDKProvider from ndk-hooks
    return (
        <NDKProvider ndk={ndk}>
            {/* Your App Components */}
            <LoginScreen />
        </NDKProvider>
    );
}

export default App;
```

### Logging In / Adding Signers

Use the `addSigner` function from `@nostr-dev-kit/ndk-hooks` to log users in. `useSessionMonitor` will automatically persist the signer and session state.

```tsx
// Example: LoginScreen.tsx
import React from 'react';
import { Button, Text, View } from 'react-native';
import { useNDKStore, useNDKSessions, addSigner } from '@nostr-dev-kit/ndk-hooks';
import { NDKPrivateKeySigner, NDKNip07Signer } from '@nostr-dev-kit/ndk'; // Import core signers
// Import NIP-55 signer if needed
// import { NDKNip55Signer } from '@nostr-dev-kit/ndk-mobile';

function LoginScreen() {
    const { currentUser } = useNDKStore(); // Get current user from NDK context

    const handleLoginNsec = async () => {
        try {
            // Replace with actual nsec retrieval (e.g., from input or secure storage)
            const nsec = "nsec1...";
            const signer = new NDKPrivateKeySigner(nsec);
            await addSigner(signer); // Adds signer and makes session active
            console.log("Logged in with NSEC");
        } catch (error) {
            console.error("NSEC Login Error:", error);
            // Handle error (e.g., show message to user)
        }
    };

    const handleLoginNip07 = async () => {
        try {
            // NIP-07 requires a compatible browser extension environment
            const signer = new NDKNip07Signer();
            // blockUntilReady might be needed depending on extension readiness
            await signer.blockUntilReady();
            await addSigner(signer);
            console.log("Logged in with NIP-07");
        } catch (error) {
            console.error("NIP-07 Login Error:", error);
            // Handle error (e.g., extension not found)
        }
    };

    // Add similar handlers for NIP-46 or NIP-55 if needed

    return (
        <View>
            {currentUser ? (
                <Text>Logged in: {currentUser.profile?.name || currentUser.pubkey.substring(0, 10)}</Text>
                // Add a logout button using switchToUser("") from useNDKSessions
            ) : (
                <View>
                    <Button onPress={handleLoginNsec} title="Login with NSEC" />
                    {/* Add buttons for other login methods */}
                    {/* <Button onPress={handleLoginNip07} title="Login with Extension (NIP-07)" /> */}
                </View>
            )}
        </View>
    );
}

export default LoginScreen;
```

## Example

For a real application using this look at [Olas](https://github.com/pablof7z/olas).
