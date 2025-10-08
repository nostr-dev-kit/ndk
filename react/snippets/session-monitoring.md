# Session Monitoring in React

This snippet demonstrates how to set up session monitoring in a React application using ndk-hooks. Session monitoring allows your application to automatically persist and restore user sessions across page reloads or app restarts.

## Example: Setting Up Session Monitoring with Headless Component Pattern

```tsx
// components/ndk.tsx
'use client';

// Here we will initialize NDK and configure it to be available throughout the application
import NDK, { NDKNip07Signer, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

// An optional in-browser cache adapter
import NDKCacheAdapterDexie from "@nostr-dev-kit/cache-dexie";
import { NDKSessionLocalStorage, useNDKInit, useNDKSessionMonitor } from "@nostr-dev-kit/react";
import { useEffect } from "react";

// Define explicit relays or use defaults
const explicitRelayUrls = ["wss://relay.primal.net", "wss://nos.lol", "wss://purplepag.es"];

// Setup Dexie cache adapter (Client-side only)
let cacheAdapter: NDKCacheAdapterDexie | undefined;
if (typeof window !== "undefined") {
    cacheAdapter = new NDKCacheAdapterDexie({ dbName: "your-app-name" });
}

// Create the singleton NDK instance
const ndk = new NDK({ explicitRelayUrls, cacheAdapter });

// Connect to relays on initialization
ndk.connect();

// Use the browser's localStorage for session storage
const sessionStorage = new NDKSessionLocalStorage();

/**
 * Use an NDKHeadless component to initialize NDK in order to prevent application-rerenders
 * when there are changes to the NDK or session state.
 * 
 * Include this headless component in your app layout to initialize NDK correctly.
 */
export default function NDKHeadless() {
    const initNDK = useNDKInit();

    useNDKSessionMonitor(sessionStorage, {
        profile: true, // automatically fetch profile information for the active user
        follows: true, // automatically fetch follows of the active user
    });

    useEffect(() => {
        if (ndk) initNDK(ndk);
    }, [initNDK])
    
    return null;
}
```

```tsx
// src/App.tsx
import React from 'react';
import { useNDKCurrentPubkey } from '@nostr-dev-kit/react';
import NDKHeadless from "./components/ndk"; // Import the headless component
import YourMainApp from './YourMainApp'; // Your main application component

function App() {
  const currentPubkey = useNDKCurrentPubkey();
  
  return (
    <div>
      {/* Include the headless component to initialize NDK and session monitoring */}
      <NDKHeadless />
      
      <h1>NDK Session Example</h1>
      {currentPubkey ? (
        <div>
          <p>Logged in as: {currentPubkey.slice(0, 8)}...</p>
          {/* Your app content for logged-in users */}
        </div>
      ) : (
        <div>
          <p>Not logged in</p>
          {/* Your login UI */}
        </div>
      )}
    </div>
  );
}

export default App;
```

## Login Example

```tsx
import { useNDKSessionLogin, useNDKCurrentPubkey } from '@nostr-dev-kit/react';
import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import { useCallback, useEffect } from 'react';

function LoginComponent() {
  const login = useNDKSessionLogin();
  const currentPubkey = useNDKCurrentPubkey();
  
  const handleLogin = useCallback(async () => {
    // Example with private key signer - in a real app, get this securely from user input
    const nsec = "nsec1...."; // ask the user to enter their key or use their preferred login method
    const signer = new NDKPrivateKeySigner(nsec);
    
    await login(signer);
  }, [login]);
  
  useEffect(() => {
    if (!currentPubkey) {
      console.log('You are not logged in');
    } else {
      console.log('You are now logged in with user with pubkey', currentPubkey);
    }
  }, [currentPubkey]);
  
  return (
    <button onClick={handleLogin}>Login with Private Key</button>
  );
}
```

**Session Monitoring Features:**

- **Automatic Session Restoration**: Sessions are automatically restored from storage when your app loads, so users don't need to log in again.
- **Session Persistence**: New sessions are automatically persisted when users log in.
- **Storage Updates**: The storage is updated when sessions change.
- **Session Removal**: Sessions are removed from storage when users log out.
- **Profile and Follows**: Optionally fetch and monitor the user's profile information and contact list.

**Usage tips:**

- The `NDKSessionLocalStorage` class provides a default implementation that uses the browser's localStorage.
- The `useNDKSessionMonitor` hook takes a storage adapter and optional configuration.
- The headless component pattern prevents unnecessary re-renders when NDK or session state changes.
- You can use this alongside other session hooks like `useNDKSessionLogin`, `useNDKSessionLogout`, and `useNDKSessionSwitch`.
- For multi-account support, use `useNDKSessionSwitch` to switch between different user sessions.