# NDK Store and Hooks

This document provides comprehensive documentation for the NDK store and hooks implementation in `@nostr-dev-kit/ndk-hooks`.

## Table of Contents

- [Overview](#overview)
- [Installation and Setup](#installation-and-setup)
- [Core Concepts](#core-concepts)
  - [NDK Store](#ndk-store)
  - [Current User](#current-user)
- [Usage](#usage)
  - [Setting up NDK in Your Application](#setting-up-ndk-in-your-application)
  - [Using the `useNDK` Hook](#using-the-usendk-hook)
  - [Using the `useNDKCurrentUser` Hook](#using-the-usendkcurrentuser-hook)
  - [Handling the `signer:ready` Event](#handling-the-signerready-event)
- [API Reference](#api-reference)
  - [`useNDK`](#usendk)
  - [`useNDKCurrentUser`](#usendkcurrentuser)
  - [`useNDKStore`](#usendkstore)
- [Best Practices](#best-practices)
- [Edge Cases and Troubleshooting](#edge-cases-and-troubleshooting)
- [Examples](#examples)

## Overview

The NDK store and hooks provide a simple and efficient way to manage your NDK instance and the current user across your React application. Built with Zustand, these utilities enable you to:

- Set up an NDK instance once and access it from anywhere in your component tree
- Access and update the current user from any component
- Handle NDK events like `signer:ready` with automatic user updates
- Build React applications with a clean, idiomatic approach to Nostr integration

## Installation and Setup

First, install the package:

```bash
# npm
npm install @nostr-dev-kit/ndk-hooks

# pnpm
pnpm add @nostr-dev-kit/ndk-hooks

# yarn
yarn add @nostr-dev-kit/ndk-hooks
```

### Requirements

- React 16.8.0 or higher (for hooks support)
- @nostr-dev-kit/ndk ^2.13
- zustand ^5

## Core Concepts

### NDK Store

The NDK store is a Zustand store that manages:

1. An NDK instance
2. The current user (if logged in)
3. Event listeners for NDK events

The store is automatically initialized when you import the hooks, but you need to set the NDK instance using the `setNDK` function.

### Current User

The current user represents the user that is currently logged in to your application. It is automatically set when:

1. The `signer:ready` event is fired by the NDK instance
2. You manually set it using the `setCurrentUser` function

## Usage

### Setting up NDK in Your Application

Typically, you'll want to set up the NDK instance at the root of your application:

```tsx
import React, { useEffect } from 'react';
import NDK from '@nostr-dev-kit/ndk';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';

function App() {
  const { setNDK } = useNDK();
  
  useEffect(() => {
    // Initialize NDK
    const ndk = new NDK({
      explicitRelayUrls: ['wss://relay.nostr.band', 'wss://relay.damus.io'],
    });
    
    // Connect to relays
    ndk.connect().then(() => {
      // Set the NDK instance in the store
      setNDK(ndk);
    });
    
    return () => {
      // Clean up (optional)
    };
  }, [setNDK]);
  
  return (
    <div>
      {/* Your application content */}
      <YourComponents />
    </div>
  );
}
```

### Using the `useNDK` Hook

The `useNDK` hook provides access to the NDK instance and a function to set it:

```tsx
import { useNDK } from '@nostr-dev-kit/ndk-hooks';

function YourComponent() {
  const { ndk, setNDK } = useNDK();
  
  // Check if NDK is ready
  if (!ndk) {
    return <div>Loading NDK...</div>;
  }
  
  // Use the NDK instance
  const handleClick = async () => {
    const events = await ndk.fetchEvents({
      kinds: [1],
      limit: 10,
    });
    console.log('Latest notes:', events);
  };
  
  return (
    <div>
      <h2>NDK is ready!</h2>
      <button onClick={handleClick}>Fetch latest notes</button>
    </div>
  );
}
```

### Using the `useNDKCurrentUser` Hook

The `useNDKCurrentUser` hook provides access to the current user and a function to set it:

```tsx
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';

function Profile() {
  const { currentUser, setCurrentUser } = useNDKCurrentUser();
  
  // Check if user is logged in
  if (!currentUser) {
    return <div>Not logged in</div>;
  }
  
  // Log out handler
  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  return (
    <div>
      <h2>User Profile</h2>
      <p>Public Key: {currentUser.pubkey}</p>
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
}
```

### Handling the `signer:ready` Event

The NDK store automatically sets up an event listener for the `signer:ready` event. When this event is fired, the current user is automatically updated in the store.

This is particularly useful when using browser extensions like nos2x or Alby, which may not be immediately ready when your application loads.

Here's how it works behind the scenes:

```tsx
// This happens automatically when you call setNDK()
ndk.on('signer:ready', () => {
  const currentUser = ndk.getUser();
  // Updates the currentUser in the store
  setCurrentUser(currentUser);
});
```

## API Reference

### `useNDK`

```typescript
function useNDK(): {
  ndk: NDK | null;
  setNDK: (ndk: NDK) => void;
}
```

A hook that provides access to the NDK instance and a function to set it.

**Returns:**

- `ndk` - The current NDK instance or `null` if not set
- `setNDK` - Function to set the NDK instance

### `useNDKCurrentUser`

```typescript
function useNDKCurrentUser(): {
  currentUser: NDKUser | null;
  setCurrentUser: (user: NDKUser | null) => void;
}
```

A hook that provides access to the current user and a function to set it.

**Returns:**

- `currentUser` - The current user or `null` if not logged in
- `setCurrentUser` - Function to set the current user

### `useNDKStore`

```typescript
const useNDKStore = create<NDKStoreState>((set) => ({
  ndk: null,
  currentUser: null,
  setNDK: (ndk: NDK) => { /* ... */ },
  setCurrentUser: (user: NDKUser | null) => { /* ... */ },
}));
```

The underlying Zustand store that powers the hooks. You can use this directly for more advanced use cases.

**State:**

- `ndk` - The current NDK instance or `null` if not set
- `currentUser` - The current user or `null` if not logged in

**Methods:**

- `setNDK` - Function to set the NDK instance
- `setCurrentUser` - Function to set the current user

## Best Practices

### Initializing NDK Once

Initialize the NDK instance at the root of your application to ensure it's available throughout:

```tsx
// In your App.tsx or index.tsx
useEffect(() => {
  const ndk = new NDK({
    explicitRelayUrls: ['wss://relay.nostr.band', 'wss://relay.damus.io'],
  });
  
  ndk.connect().then(() => {
    setNDK(ndk);
  });
}, []);
```

### Managing User Authentication

When implementing user authentication, update the current user accordingly:

```tsx
// When signing in
const handleSignIn = async () => {
  // Using a BrowserExtensionSigner
  await ndk.signer.blockUntilReady();
  const user = ndk.getUser();
  // This will trigger updates in all components using useNDKCurrentUser
  setCurrentUser(user);
};

// When logging out
const handleLogout = () => {
  setCurrentUser(null);
};
```

### Error Handling

Always handle potential errors when working with NDK:

```tsx
try {
  await ndk.connect();
  setNDK(ndk);
} catch (error) {
  console.error('Failed to connect to relays:', error);
  // Show error message to user
}
```

## Edge Cases and Troubleshooting

### NDK Instance Not Available

If components are rendering before the NDK instance is available:

```tsx
function YourComponent() {
  const { ndk } = useNDK();
  
  if (!ndk) {
    return <div>Loading NDK...</div>;
  }
  
  // Safe to use ndk here
  return <div>NDK is ready!</div>;
}
```

### Handling Signer Delays

Browser extension signers may take time to become ready:

```tsx
const { ndk } = useNDK();
const { currentUser } = useNDKCurrentUser();
const [isSignerReady, setSignerReady] = useState(false);

useEffect(() => {
  if (ndk && ndk.signer) {
    // Listen for the signer to become ready
    ndk.on('signer:ready', () => {
      setSignerReady(true);
    });
    
    // Check if already ready
    if (ndk.signer.isReady) {
      setSignerReady(true);
    }
  }
}, [ndk]);

// Now you can use isSignerReady in your UI
```

### Clean Up Event Listeners

The NDK store handles cleanup automatically, but if you add your own listeners:

```tsx
useEffect(() => {
  if (!ndk) return;
  
  const handler = () => {
    console.log('NDK is ready');
  };
  
  ndk.on('ready', handler);
  
  return () => {
    ndk.off('ready', handler);
  };
}, [ndk]);
```

## Examples

### Complete Application Example

```tsx
import React, { useEffect, useState } from 'react';
import NDK, { NDKNip07Signer } from '@nostr-dev-kit/ndk';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';

function App() {
  const { ndk, setNDK } = useNDK();
  const { currentUser, setCurrentUser } = useNDKCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize NDK with browser extension signer
  useEffect(() => {
    const initNDK = async () => {
      try {
        // Create NDK instance with browser extension signer
        const signer = new NDKNip07Signer();
        const ndk = new NDK({
          explicitRelayUrls: [
            'wss://relay.nostr.band',
            'wss://relay.damus.io',
            'wss://nos.lol',
          ],
          signer,
        });
        
        // Connect to relays
        await ndk.connect();
        
        // Set the NDK instance
        setNDK(ndk);
        
        // The signer:ready event will trigger automatically
        // and update the currentUser via the store's event listener
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize NDK:', error);
        setIsLoading(false);
      }
    };
    
    initNDK();
  }, [setNDK]);
  
  // Sign in handler
  const handleSignIn = async () => {
    if (!ndk || !ndk.signer) return;
    
    try {
      // This will prompt the user to authorize the extension
      await ndk.signer.blockUntilReady();
      
      // Get the user
      const user = ndk.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };
  
  // Sign out handler
  const handleSignOut = () => {
    setCurrentUser(null);
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="app">
      <h1>Nostr Application</h1>
      
      {currentUser ? (
        <div>
          <h2>Welcome, {currentUser.pubkey.substring(0, 8)}...</h2>
          <button onClick={handleSignOut}>Sign Out</button>
          
          {/* Your app content for logged-in users */}
          <div className="content">
            {/* Components that need NDK or currentUser */}
          </div>
        </div>
      ) : (
        <div>
          <h2>Please sign in</h2>
          <button onClick={handleSignIn}>
            Sign in with Nostr Extension
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
```

This example demonstrates a complete application that:

1. Initializes NDK with a browser extension signer
2. Sets up the NDK store
3. Handles user authentication
4. Shows different UI based on the login state