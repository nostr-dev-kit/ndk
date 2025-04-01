# NDK Store and Hooks

This document provides comprehensive documentation for the NDK store and hooks implementation in `@nostr-dev-kit/ndk-hooks`.

## Table of Contents

- [Overview](#overview)
- [Installation and Setup](#installation-and-setup)
- [Core Concepts](#core-concepts)
  - [NDK Store](#ndk-store)
  - [Multi-Signer Support](#multi-signer-support)
  - [Active User](#active-user)
- [Usage](#usage)
  - [Setting up NDK in Your Application](#setting-up-ndk-in-your-application)
  - [Using the `useNDK` Hook](#using-the-usendk-hook)
  - [Using the `useNDKCurrentUser` Hook](#using-the-usendkcurrentuser-hook)
  - [Handling the `signer:ready` Event](#handling-the-signerready-event)
- [API Reference](#api-reference)
  - [`useNDK`](#usendk)
  - [`useNDKCurrentUser`](#usendkcurrentuser)
   - [`useAvailableSessions`](#useavailablesessions)
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

1. An NDK instance (`ndk`)
2. The currently active user (`currentUser`)
3. A map of available signers (`signers: Map<Hexpubkey, NDKSigner>`)

The store is automatically initialized when you import the hooks, but you need to set the NDK instance using the `setNDK` function. Signers can be added using `addSigner`, and the active user is changed using `switchToUser`.
### Multi-Signer Support & Login Flow

The store now supports managing multiple `NDKSigner` instances simultaneously. This is the primary mechanism for handling user "logins" in applications using `ndk-hooks`. Instead of a single global login, you can add signers for different users and switch the active context between them.

- **Logging In (Adding a Signer):** The process of "logging in" involves obtaining an `NDKSigner` (e.g., via a browser extension like NIP-07, or from a private key/nsec) and adding it to the store using `addSigner(signer: NDKSigner)`. This registers the user's credentials with the application session.
- **Activating a User Session (Switching User):** After adding a signer, or to switch between already added users, call `switchToUser(pubkey: Hexpubkey)`. This makes the specified user the `currentUser` and activates their signer (if available) for subsequent actions.
<!-- This line is redundant with the point below -->

### Active User

The `currentUser` in the store represents the user whose context is currently active. This user might have an associated signer (meaning actions can be signed) or might be a "read-only" user (meaning the application is viewing their perspective without the ability to sign events as them).

The active user is set exclusively via the `switchToUser(pubkey)` method:
1. If a signer associated with the provided `pubkey` exists in the `signers` map, that signer becomes active (`ndk.signer` is set), and the corresponding `NDKUser` becomes the `currentUser`.
2. If no signer exists for the `pubkey`, `ndk.signer` is set to `undefined`, making the session read-only for signing purposes, and the `NDKUser` for that pubkey becomes the `currentUser`.

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

The `useNDKCurrentUser` hook provides read-only access to the currently active user:

```tsx
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';

function ProfileDisplay() {
  // Note: setCurrentUser is no longer provided by this hook
  const { currentUser } = useNDKCurrentUser();

  // Check if a user context is active
  if (!currentUser) {
    return <div>No active user selected</div>;
  }

  // Display user information
  return (
    <div>
      <h2>Active User Profile</h2>
      <p>Public Key: {currentUser.pubkey}</p>
      {/* Fetch and display profile details using useProfile hook */}
    </div>
  );
}
```
To change the active user, you need to use the `switchToUser` method from the store directly or via the `useNDKStore` hook.

### Adding Signers and Switching Users

You typically interact with `addSigner` and `switchToUser` via the store instance obtained from `useNDKStore`.

```tsx
import { useNDKStore } from '@nostr-dev-kit/ndk-hooks';
import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

function UserManager() {
  const { addSigner, switchToUser, signers, currentUser } = useNDKStore();

  const addNip07Signer = async () => {
    const nip07Signer = new NDKNip07Signer();
    // This might prompt the user if the extension requires authorization
    await addSigner(nip07Signer);
    // Optionally switch to this user immediately
    const user = await nip07Signer.user();
    await switchToUser(user.pubkey);
  };

  const addPrivateKeySigner = async (nsec: string) => {
    try {
       const pkSigner = new NDKPrivateKeySigner(nsec);
       await addSigner(pkSigner);
       console.log('Private key signer added.');
    } catch (e) {
       console.error("Failed to add private key signer", e);
    }
  };

  const switchToExistingUser = async (pubkey: Hexpubkey) => {
    await switchToUser(pubkey);
  };

  const viewProfileReadOnly = async (pubkey: Hexpubkey) => {
    // Switch to a user even if we don't have their signer
    await switchToUser(pubkey);
  }

  return (
    <div>
      <h2>User Management</h2>
      <button onClick={addNip07Signer}>Add NIP-07 Signer (Extension)</button>
      {/* UI to input nsec */}
      <button onClick={() => addPrivateKeySigner("nsec...")}>Add Private Key Signer</button>

      <h3>Available Signers:</h3>
      <ul>
        {Array.from(signers.keys()).map(pubkey => (
          <li key={pubkey}>
            {pubkey.substring(0, 8)}...
            <button onClick={() => switchToExistingUser(pubkey)}>
              Switch to this User
            </button>
          </li>
        ))}
      </ul>

       {/* UI to input a pubkey for read-only view */}
      <button onClick={() => viewProfileReadOnly("pubkey...")}>View Profile Read-Only</button>


      {currentUser && (
        <p>Currently active user: {currentUser.pubkey.substring(0,8)}...</p>
      )}
    </div>
  );
}

```

<!-- This section is removed as signer:ready no longer controls currentUser -->

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
  // setCurrentUser is removed
}
```

A hook that provides read-only access to the currently active user.

**Returns:**

- `currentUser` - The currently active `NDKUser` or `null` if no user context is active.


### `useAvailableSessions`

```typescript
function useAvailableSessions(): {
  availablePubkeys: Hexpubkey[];
}
```

A hook that provides a list of available session pubkeys.

This hook retrieves the list of signers currently managed by the `useNDKStore` and returns an array of their corresponding public keys (hex format). This represents the user sessions that have been added (e.g., via `addSigner`) and are available to be switched to using `switchToUser`.

**Returns:**

- `availablePubkeys` - An array of `Hexpubkey` strings representing the pubkeys of available signers.

**Example:**

```tsx
import { useAvailableSessions, useNDKStore } from '@nostr-dev-kit/ndk-hooks';

function SessionSwitcher() {
  const { availablePubkeys } = useAvailableSessions();
  const { switchToUser } = useNDKStore();

  if (!availablePubkeys.length) {
    return <div>No sessions available. Add a signer first.</div>;
  }

  return (
    <div>
      <h3>Available Sessions:</h3>
      <ul>
        {availablePubkeys.map(pubkey => (
          <li key={pubkey}>
            {pubkey.substring(0, 10)}...
            <button onClick={() => switchToUser(pubkey)}>Switch to</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### `useNDKStore`

```typescript
const useNDKStore = create<NDKStoreState>((set, get) => ({
  ndk: null,
  currentUser: null,
  signers: new Map<Hexpubkey, NDKSigner>(),
  setNDK: (ndk: NDK) => { /* ... */ },
  addSigner: async (signer: NDKSigner) => { /* ... */ },
  switchToUser: async (pubkey: Hexpubkey) => { /* ... */ },
}));
```

The underlying Zustand store that powers the hooks. You can use this directly for more advanced use cases.

**State:**

- `ndk` - The current NDK instance or `null`.
- `currentUser` - The currently active `NDKUser` or `null`.
- `signers` - A `Map<Hexpubkey, NDKSigner>` storing available signers.

**Methods:**

- `setNDK(ndk: NDK)` - Sets the NDK instance.
- `addSigner(signer: NDKSigner)` - Adds a signer to the `signers` map. Returns a Promise.
- `switchToUser(pubkey: Hexpubkey)` - Switches the active user context. Sets `ndk.signer` if a signer is found, otherwise sets it to `undefined`. Updates `currentUser`. Returns a Promise.

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

### Managing User Logins and Sessions

Use `addSigner` and `switchToUser` to manage user logins and active sessions:

```tsx
import { useNDKStore } from '@nostr-dev-kit/ndk-hooks';
import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

const { addSigner, switchToUser } = useNDKStore.getState();

// Login with a browser extension (NIP-07)
const loginWithExtension = async () => {
  const signer = new NDKNip07Signer();
  await addSigner(signer); // Add the signer first (login step)
  const user = await signer.user();
  await switchToUser(user.pubkey); // Activate this user's session
  console.log(`User ${user.pubkey} logged in and active.`);
};

// Login with a private key (nsec)
const loginWithNsec = async (nsec: string) => {
  const signer = new NDKPrivateKeySigner(nsec);
  await addSigner(signer); // Add the signer (login step)
  const user = await signer.user();
  await switchToUser(user.pubkey); // Activate this user's session
  console.log(`User ${user.pubkey} logged in via nsec and active.`);
};

// Switch to an already logged-in user's session
const switchActiveUser = async (pubkey: Hexpubkey) => {
  await switchToUser(pubkey);
  console.log(`Switched active session to user ${pubkey}.`);
};

// "Log out" (Deactivate current user session)
const logout = async () => {
  // Logging out means switching the active context away from the current user.
  // How you implement this depends on your application's desired state after logout.
  // Option 1: Switch to a known read-only user/pubkey (e.g., a default view)
  //   await switchToUser("some_read_only_pubkey");
  // Option 2: Switch to another logged-in user if one exists
  //   const otherUserPubkey = Array.from(useNDKStore.getState().signers.keys()).find(pk => pk !== currentUser?.pubkey);
  //   if (otherUserPubkey) await switchToUser(otherUserPubkey);
  // Option 3: Implement a dedicated 'logout' or 'clearCurrentUser' action in the store
  //   (This would require modifying the store itself)

  console.log("Logout: Switched context away from the user.");
  // Example: Switch to a placeholder read-only pubkey if defined
  // await switchToUser(PLACEHOLDER_READONLY_PUBKEY);
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

<!-- This section is removed as signer readiness is handled within addSigner/switchToUser -->

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

### Multi-User Application Example

```tsx
import React, { useEffect, useState } from 'react';
import NDK, { NDKNip07Signer, NDKPrivateKeySigner, Hexpubkey } from '@nostr-dev-kit/ndk';
import { useNDKStore, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks'; // Assuming useNDK is also exported if needed separately

function App() {
  // Use the store directly for actions
  const { ndk, setNDK, addSigner, switchToUser, signers } = useNDKStore();
  // Use the specific hook for observing the current user
  const { currentUser } = useNDKCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  const [nsecInput, setNsecInput] = useState('');

  // Initialize NDK (without a default signer initially)
  useEffect(() => {
    const initNDK = async () => {
      try {
        const ndkInstance = new NDK({
          explicitRelayUrls: [
            'wss://relay.nostr.band',
            'wss://relay.damus.io',
            'wss://nos.lol',
          ],
          // No initial signer, will be set via switchToUser
        });

        await ndkInstance.connect();
        setNDK(ndkInstance);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize NDK:', error);
        setIsLoading(false);
      }
    };
    initNDK();
  }, [setNDK]);

  // Add NIP-07 Signer (e.g., from browser extension)
  const handleAddNip07 = async () => {
    try {
      const signer = new NDKNip07Signer();
      // NDK/Signer might handle prompting the user here
      await addSigner(signer);
      // Optionally switch to this user immediately
      const user = await signer.user();
      await switchToUser(user.pubkey);
    } catch (error) {
      console.error('Failed to add NIP-07 signer:', error);
    }
  };

  // Add Private Key Signer
  const handleAddPrivateKey = async () => {
    if (!nsecInput) return;
    try {
      const signer = new NDKPrivateKeySigner(nsecInput);
      await addSigner(signer);
      setNsecInput(''); // Clear input
      // Optionally switch
      const user = await signer.user();
      await switchToUser(user.pubkey);
    } catch (error) {
      console.error('Failed to add private key signer:', error);
    }
  };

  // Switch to an existing user
  const handleSwitchUser = async (pubkey: Hexpubkey) => {
    await switchToUser(pubkey);
  };

  // Deactivate current user (e.g., switch to a known read-only pubkey or null state)
  const handleDeactivate = async () => {
      // Example: Switch to a known public figure's pubkey for read-only view
      await switchToUser("npub1..."); // Replace with a real pubkey if needed
      // Or implement a way to set currentUser to null if desired
  };


  if (isLoading) {
    return <div>Loading NDK...</div>;
  }

  return (
    <div className="app">
      <h1>Multi-User Nostr App</h1>

      <div>
        <button onClick={handleAddNip07}>Add Signer (Browser Extension)</button>
      </div>

      <div>
        <input
          type="password" // Use password type for nsec
          value={nsecInput}
          onChange={(e) => setNsecInput(e.target.value)}
          placeholder="Enter nsec..."
        />
        <button onClick={handleAddPrivateKey} disabled={!nsecInput}>
          Add Signer (Private Key)
        </button>
      </div>

      <hr />

      <div>
        <h3>Available Users (Signers):</h3>
        {signers.size === 0 ? (
          <p>No signers added yet.</p>
        ) : (
          <ul>
            {Array.from(signers.keys()).map(pubkey => (
              <li key={pubkey}>
                User: {pubkey.substring(0, 8)}...
                <button onClick={() => handleSwitchUser(pubkey)} disabled={currentUser?.pubkey === pubkey}>
                  {currentUser?.pubkey === pubkey ? 'Active' : 'Switch To'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      {currentUser ? (
        <div>
          <h2>Active User: {currentUser.pubkey.substring(0, 8)}...</h2>
          {signers.has(currentUser.pubkey) ? (
            <p>(Signer available)</p>
          ) : (
            <p>(Read-only mode)</p>
          )}
          <button onClick={handleDeactivate}>Deactivate User</button>

          {/* Your app content - components can use currentUser */}
          <div className="content">
            <p>Displaying content relevant to {currentUser.pubkey}</p>
            {/* Example: <UserProfile pubkey={currentUser.pubkey} /> */}
            {/* Example: <NoteComposer canSign={signers.has(currentUser.pubkey)} /> */}
          </div>
        </div>
      ) : (
        <div>
          <h2>No active user</h2>
          <p>Add a signer or switch to an existing one.</p>
        </div>
      )}
    </div>
  );
}

export default App;
```

This example demonstrates a multi-user application that:

1. Initializes NDK without an initial signer.
2. Allows adding signers via NIP-07 (extension) or private key.
3. Lists available signers (users).
4. Allows switching between users, activating their signer if available.
5. Displays the currently active user and whether they are in read-only mode.
6. Provides a way to "deactivate" the current user context.