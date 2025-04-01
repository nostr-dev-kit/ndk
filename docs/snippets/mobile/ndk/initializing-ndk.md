# Initializing NDK in Mobile Apps

This guide demonstrates how to properly initialize NDK in a mobile application context using `@nostr-dev-kit/ndk-mobile`.

## Basic Setup

Mobile applications should NOT import or install `@nostr-dev-kit/ndk` and use `@nostr-dev-kit/ndk-mobile` instead.

`@nostr-dev-kit/ndk-mobile` re-exports everything `@nostr-dev-kit/ndk` exports, so anywhere you see an example using `@nostr-dev-kit/ndk` just substitute with `@nostr-dev-kit/ndk-mobile` and it will work correctly.

```typescript
import NDK, { NDKCacheAdapterSqlite } from "@nostr-dev-kit/ndk-mobile";

// Initialize SQLite cache adapter
const cacheAdapter = new NDKCacheAdapterSqlite("app-name");
cacheAdapter.initialize();

// If you have a strategy to store data, like on an app database you can
// use it to store the logged in pubkey
const currentUserPubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";

function initializeNDK(currentUserPubkey?: string) {
    // Create NDK instance with configuration
    const ndk = new NDK({
        cacheAdapter,
        explicitRelayUrls: ["wss://f7z.io", "wss://relay.primal.net"],
        clientName: "your-app-name",
    });

    // Set active user if provided
    if (currentUserPubkey) {
        ndk.activeUser = ndk.getUser({ pubkey: currentUserPubkey });
    }

    // Connect to relays
    ndk.connect();

    return ndk;
}
```

## Usage with React Hooks

```typescript
import { useNDKInit, useNDKSessionInit, useNDKCurrentUser } from '@nostr-dev-kit/ndk-mobile';
import { useEffect } from 'react';

function App() {
    // Initialize NDK using the function from previous examples
    const ndk = initializeNDK(); // From previous examples
    const initializeSession = useNDKSessionInit();

    // Put the ndk instance in the store system, making it accessible throughout the app
    useNDKInit(ndk, settingsStore);

    // Get current user
    const currentUser = useNDKCurrentUser();

    useEffect(() => {
        if (!currentUser?.pubkey) return;

        // Initialize session with specific kinds
        initializeSession(ndk, currentUser, settingsStore, {
            follows: true,
            muteList: true,
            subOpts: {
                wrap: true,
            }
        });
    }, [currentUser?.pubkey]);

    return <>{/* Your app content */}</>;
}
```

## Key Features

- **SQLite Cache Adapter**: Efficient local caching for mobile apps
- **Session Initialization**: Support for specific event kinds and subscription options
- **Error Handling**: Relay notice monitoring for debugging
- **Type Safety**: Full TypeScript support

## Best Practices

1. Always initialize the cache adapter before using NDK
