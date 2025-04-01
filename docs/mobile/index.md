# NDK Mobile

A React Native/Expo implementation of [NDK (Nostr Development Kit)](https://github.com/nostr-dev-kit/ndk) that provides a complete toolkit for building Nostr applications on mobile platforms.

## Features

- 🔐 Multiple signer implementations (NIP-07, NIP-46, Private Key)
- 💾 SQLite-based caching for offline support (`NDKCacheAdapterSqlite`)
- 🔄 Subscription management with automatic reconnection
- 📱 React Native and Expo compatibility
- 🪝 React hooks for easy state management (via `@nostr-dev-kit/ndk-hooks`)
- 👛 Integrated wallet support (via `@nostr-dev-kit/ndk-wallet`)

## Installation

```sh
# Install NDK Core, Hooks, Wallet, and Mobile
npm install @nostr-dev-kit/ndk @nostr-dev-kit/ndk-hooks @nostr-dev-kit/ndk-wallet @nostr-dev-kit/ndk-mobile
```

## Usage

When using this library, you primarily interact with the core `NDK` instance and hooks from `@nostr-dev-kit/ndk-hooks`. `ndk-mobile` provides the `NDKCacheAdapterSqlite` for persistence and potentially mobile-specific signer integrations in the future.

### Initialization

Initialize NDK using the `NDK` constructor, likely when your app loads. You can configure the SQLite cache adapter provided by `ndk-mobile`.

```tsx
import NDK from "@nostr-dev-kit/ndk";
import { NDKCacheAdapterSqlite } from "@nostr-dev-kit/ndk-mobile";
import { NDKProvider } from "@nostr-dev-kit/ndk-hooks"; // Import Provider
import { useEffect, useState } from "react";

async function initializeNdk() {
    const cacheAdapter = new NDKCacheAdapterSqlite("my-ndk-cache.db");
    await cacheAdapter.initialize();

    const ndkInstance = new NDK({
        cacheAdapter: cacheAdapter,
        explicitRelayUrls: [/* your relays */],
        // ... other NDK options
    });

    // Assign NDK instance back to adapter *after* NDK initialization
    cacheAdapter.ndk = ndkInstance;

    await ndkInstance.connect();
    return ndkInstance;
}

function App() {
    const [ndk, setNdk] = useState<NDK | null>(null);

    useEffect(() => {
        initializeNdk().then(setNdk);
    }, []);

    if (!ndk) {
        return <Text>Loading NDK...</Text>; // Or some loading indicator
    }

    // Wrap your app with NDKProvider from ndk-hooks
    return (
        <NDKProvider ndk={ndk}>
            {/* Your App Components */}
            <LoginScreen />
        </NDKProvider>
    );
}
```

### Using Hooks

Use hooks from `@nostr-dev-kit/ndk-hooks` to access NDK state and functionality within your components.

```tsx
import { useNDK, useNDKCurrentUser, useLogin } from "@nostr-dev-kit/ndk-hooks"; // Import hooks
import { NDKNip46Signer, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk"; // Import signers
import { Button, Text } from "react-native";
import { useEffect } from "react";

function LoginScreen() {
    const { ndk } = useNDK(); // Get NDK instance from context
    const currentUser = useNDKCurrentUser(); // Get current user from context
    const { login } = useLogin(); // Get login function from context

    useEffect(() => {
        if (currentUser) {
            console.log("Logged in as:", currentUser.pubkey);
            // Potentially navigate away or update UI
        }
    }, [currentUser]);

    const handleLogin = async () => {
        // Example: Login with a private key
        const signer = new NDKPrivateKeySigner("nsec1...");
        await login(signer);

        // Or login with NIP-46 (requires setup)
        // const nip46Signer = new NDKNip46Signer(ndk, "npub...", new NDKPrivateKeySigner("nsec_local..."));
        // await nip46Signer.blockUntilReady();
        // await login(nip46Signer);
    };

    return (
        <>
            {currentUser ? (
                <Text>Logged in: {currentUser.profile?.name || currentUser.pubkey}</Text>
            ) : (
                <Button onPress={handleLogin} title="Login with NSEC" />
            )}
        </>
    );
}
```

## Example

For a real application using this look at [Olas](https://github.com/pablof7z/olas).
