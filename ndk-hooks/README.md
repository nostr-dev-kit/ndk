# @nostr-dev-kit/ndk-hooks

> React hooks for the Nostr Development Kit (NDK)

## Overview

`@nostr-dev-kit/ndk-hooks` provides a set of React hooks and utilities to easily integrate Nostr functionality into your React applications using NDK. This library helps you efficiently manage Nostr data in your React components, including:

- NDK instance management with `useNDK`
- Current user management with `useNDKCurrentUser`
- User profile management with `useProfile`

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

First, initialize the NDK instance and make it available to your components:

```tsx
import NDK from '@nostr-dev-kit/ndk';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';

function App() {
  const { setNDK } = useNDK();
  
  useEffect(() => {
    const ndk = new NDK({
      explicitRelayUrls: ['wss://relay.nostr.band', 'wss://relay.damus.io'],
    });
    
    ndk.connect().then(() => {
      setNDK(ndk);
    });
  }, [setNDK]);
  
  return <YourApp />;
}
```

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
      {/* Display user information */}
    </div>
  );
}
```

For more details on NDK store and hooks, see the [NDK Hooks Documentation](docs/ndk-hooks.md).

### User Profile Management

Before using the profile hooks, you need to initialize the profiles store with your NDK instance:

```tsx
import NDK from '@nostr-dev-kit/ndk';
import { useUserProfilesStore } from '@nostr-dev-kit/ndk-hooks';

// During app initialization
const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.nostr.band', 'wss://relay.damus.io'],
});

await ndk.connect();

// Initialize the profiles store
useUserProfilesStore.getState().initialize(ndk);
```

### Getting a User Profile

Use the `useProfile` hook to fetch and display user profiles:

```tsx
import { useProfile } from '@nostr-dev-kit/ndk-hooks';

function UserCard({ pubkey }) {
  const profile = useProfile(pubkey);

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
const profile = useProfile(pubkey, true);
```

### Directly Accessing the Store

You can directly interact with the underlying Zustand store:

```tsx
import { useUserProfilesStore } from '@nostr-dev-kit/ndk-hooks';

// Set a profile manually
useUserProfilesStore.getState().setProfile(pubkey, profile);

// Fetch a profile manually
useUserProfilesStore.getState().fetchProfile(pubkey);

// Get all profiles
const profiles = useUserProfilesStore.getState().profiles;
```

## API Reference

### NDK Hooks

#### `useNDK(): { ndk: NDK | null, setNDK: (ndk: NDK) => void }`

Provides access to the NDK instance and a function to set it.

- `ndk` - The current NDK instance or null if not set
- `setNDK` - Function to set the NDK instance

#### `useNDKCurrentUser(): { currentUser: NDKUser | null, setCurrentUser: (user: NDKUser | null) => void }`

Provides access to the current user and a function to set it.

- `currentUser` - The current user or null if not logged in
- `setCurrentUser` - Function to set the current user

### Profile Hooks

#### `useProfile(pubkey: string, forceRefresh?: boolean): NDKUserProfile | undefined`

Fetches and returns a Nostr user profile for the given pubkey.

- `pubkey` - The hex pubkey of the user
- `forceRefresh` - (Optional) Whether to force a refresh of the profile from the network
- Returns: The user profile object or undefined if not loaded yet

### Store API

#### `useUserProfilesStore`

A Zustand store that manages user profiles.

Properties:
- `profiles` - Map of pubkeys to profile objects
- `lastFetchedAt` - Map of pubkeys to timestamps of last fetch
- `ndk` - The NDK instance

Methods:
- `initialize(ndk: NDK)` - Initialize the store with an NDK instance
- `setProfile(pubkey: string, profile: NDKUserProfile, cachedAt?: number)` - Manually set a profile
- `fetchProfile(pubkey?: string, force?: boolean)` - Fetch a profile from the network

## License

MIT