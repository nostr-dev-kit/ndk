# @nostr-dev-kit/ndk-hooks

> React hooks for the Nostr Development Kit (NDK)

## Overview

`@nostr-dev-kit/ndk-hooks` provides a set of React hooks and utilities to easily integrate Nostr functionality into your React applications using NDK. This library helps you efficiently manage Nostr data in your React components, including:

- NDK instance management with `useNDKInit` and `useNDK`
- Current user management with `useNDKCurrentUser`
- User profile management with `useProfileValue`
- Multi-user session management with `useNDKSessions`
- Event subscriptions with modern callback patterns

## Installation

```bash
# npm
npm install @nostr-dev-kit/ndk-hooks

# pnpm
pnpm add @nostr-dev-kit/ndk-hooks

# yarn
yarn add @nostr-dev-kit/ndk-hooks
```

## Requirements

- React 16.8.0 or higher
- @nostr-dev-kit/ndk ^2.13
- zustand ^5

## Usage

### NDK Store and Hooks

#### Setting Up NDK Instance

The library provides a centralized way to initialize the NDK instance across all stores using the `useNDKInit` hook:

```tsx
import NDK from '@nostr-dev-kit/ndk';
import { useNDKInit } from '@nostr-dev-kit/ndk-hooks';

const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.nostr.band', 'wss://relay.damus.io'],
});
ndk.connect();

function App() {
  const initializeNDK = useNDKInit();
  
  useEffect(() => {
    const setupNDK = async () => {
      initializeNDK(ndk);
      // This initializes the NDK instance in all stores:
      // - NDK store (for useNDK hook)
      // - Session store (for useNDKSessions hook)
      // - Profile store (for useProfileValue hook)
    };
    
    setupNDK();
  }, [initializeNDK]);
  
  return <YourApp />;
}
```

Once initialized, you can access the NDK instance with the `useNDK` hook in your components.

#### Accessing Current User

You can access and set the current user with `useNDKCurrentUser`:

```tsx
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';

function UserProfile() {
  const { currentUser } = useNDKCurrentUser();
  
  if (!currentUser) {
    return <div>Not logged in</div>;
  }
  
  return (
    <div>
      <h2>Logged in as: {currentUser.pubkey}</h2>
    </div>
  );
}
```

For more details on NDK store and hooks, see the [NDK Hooks Documentation](docs/ndk-hooks.md).

### User Profile Management

The profile management functionality is automatically initialized when you use the `useNDKInit` hook as shown above. You don't need to do any additional setup.

### Getting a User Profile

Use the `useProfileValue` hook to fetch and display user profiles:

```tsx
import { useProfileValue } from '@nostr-dev-kit/ndk-hooks';

function UserCard({ pubkey }) {
  const profile = useProfileValue(pubkey);

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      <img src={profile.picture} alt={profile.name} />
      <h2>{profile.name || 'Anonymous'}</h2>
      <p>{profile.about}</p>
    </div>
  );
}
```

### Forcing a Profile Refresh

You can force a profile to be refreshed from the network by passing `true` as the second parameter:

```tsx
// This will fetch the profile from the network even if it's cached
const profile = useProfileValue(pubkey, true);
```

## API Reference

### NDK Hooks

#### `useNDKInit(): (ndkInstance: NDK) => void`

Provides a function to initialize the NDK instance across all stores in the application.

- Returns a function that takes an NDK instance and initializes it in all stores
- This is the recommended way to set up NDK in your application

#### `useNDK(): { ndk: NDK | null, setNDK: (ndk: NDK) => void }`

Provides access to the NDK instance and a function to set it.

- `ndk` - The current NDK instance or null if not set
- `setNDK` - Function to set the NDK instance

#### `useNDKCurrentUser(): { currentUser: NDKUser | null, setCurrentUser: (user: NDKUser | null) => void }`

Provides access to the current user and a function to set it.

- `currentUser` - The current user or null if not logged in
- `setCurrentUser` - Function to set the current user

### Profile Hooks

#### `useProfileValue(pubkey: string, forceRefresh?: boolean): NDKUserProfile | undefined`

Fetches and returns a Nostr user profile for the given pubkey.

- `pubkey` - The hex pubkey of the user
- `forceRefresh` - (Optional) Whether to force a refresh of the profile from the network
- Returns: The user profile object or undefined if not loaded yet

### Session Management

#### `useNDKSessions`

A Zustand store that manages user sessions. The store now manages its own NDK instance internally.

Properties:
- `ndk` - The NDK instance used by the session store
- `sessions` - Map of pubkeys to session data
- `activeSessionPubkey` - The pubkey of the active session

Public Methods:
- `initSession(user: NDKUser, signer?: NDKSigner, opts?: SessionInitOptions)` - Initialize a session for a user
- `deleteSession(pubkey: string)` - Delete a session
- `setActiveSession(pubkey: string | null)` - Set the active session
- `muteItemForSession(pubkey: string, value: string, itemType: string, publish?: boolean)` - Mute an item for a session

#### `useUserSession(pubkey?: string): UserSessionData | undefined`

Returns the session data for the specified pubkey or the active session if no pubkey is provided.

For more details on session management, see the [Session Management Documentation](docs/session-management.md).

## License

MIT