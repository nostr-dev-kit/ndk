# NDK React Hooks

`@nostr-dev-kit/ndk-hooks` provides a set of React hooks and utilities to seamlessly integrate Nostr functionality into your React applications using the Nostr Development Kit (NDK). This library simplifies managing Nostr data, user sessions, and event subscriptions within your React components.

## Initialization

The core of `ndk-hooks` revolves around a shared NDK instance. Initialize it once at the root of your application using the `useNDKInit` hook. This ensures all hooks and stores use the same NDK configuration.

```tsx
// src/App.tsx
import React, { useEffect } from 'react';
import NDK from '@nostr-dev-kit/ndk';
import { useNDKInit } from '@nostr-dev-kit/ndk-hooks';
import YourMainApp from './YourMainApp'; // Your main application component

// Configure your NDK instance
const ndkInstance = new NDK({
  explicitRelayUrls: ['wss://relay.nostr.band', 'wss://relay.damus.io'],
  // Add other NDK options like signer, cache, etc.
});
ndkInstance.connect();

function App() {
  const initializeNDK = useNDKInit();

  useEffect(() => {
    const setupNDK = async () => {
      // Initialize the NDK instance in all ndk-hooks stores
      initializeNDK(ndkInstance);
    };

    setupNDK();

    // Optional: Disconnect on component unmount
    return () => {
      ndkInstance.pool?.shutdown();
    };
  }, [initializeNDK]);

  return <YourMainApp />;
}

export default App;
```

Once initialized, you can access the NDK instance anywhere in your component tree using the `useNDK` hook if needed, although many hooks use it implicitly.

```tsx
import { useNDK } from '@nostr-dev-kit/ndk-hooks';

function MyComponent() {
  const { ndk } = useNDK();

  // Use ndk instance...
}
```

## Logging In
`ndk-hooks` supports multiple-sessions. Use `useNDKSessionLogin()` to add a session.

Sessions can be read-only (logging by providing an `NDKUser`) or full-sessions with signing access (logging by providing an `NDKSigner`).

```tsx
import {useNDKSessionLogin, useNDKCurrentUser} from '@nostr-dev-kit/ndk-hooks';
import {NDKPrivateKeySigner} from '@nostr-dev-kit/ndk';

function Signin() {
  const login = useNDKSessionLogin();
  const nsec = "nsec1...."; // ask the user to enter their key or the preferred login method.
  const currentUser = useNDKCurrentUser();

  const handleLogin = useCallback(async () => {
    const signer = new NDKPrivateKeySigner(nsec);
    
    await login(signer)
    aloert("hello!")
  }, [])

  useEffect(() => {
    if (!currentUser) {
      console.log('you are not logged in)
    } else {
      console.log('you are now logged in with user with pubkey', currentUser.pubkey)
    }
  }, [currentUser])
}
```

## Fetching User Profiles

Easily fetch and display Nostr user profiles using the `useProfile` hook. It handles caching and fetching logic automatically.

```tsx
// src/components/UserCard.tsx
import React from 'react';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';

interface UserCardProps {
  pubkey: string;
}

function UserCard({ pubkey }: UserCardProps) {
  // Fetch profile, force refresh by passing `true` as second argument
  const profile = useProfile(pubkey);

  if (!profile) {
    return <div>Loading profile for {pubkey.substring(0, 8)}...</div>;
  }

  return (
    <div>
      <img
        src={profile.picture || '/default-avatar.png'}
        alt={profile.name || 'User Avatar'}
        width={50}
        height={50}
        style={{ borderRadius: '50%' }}
      />
      <h2>{profile.displayName || profile.name || 'Anonymous'}</h2>
      <p>{profile.about}</p>
      {profile.nip05 && <p>NIP-05: {profile.nip05}</p>}
    </div>
  );
}

export default UserCard;
```

## Managing User Sessions (Login & Multi-Account)

`ndk-hooks` provides robust session management, supporting both single and multiple user accounts.

## Subscribing to Events

Use the `useSubscribe` hook for subscribing to Nostr events based on filters. It returns the events found in a stable set.

```tsx
// src/components/NoteFeed.tsx
import React, { useState } from 'react';
import { NDKFilter, NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { useSubscribe } from '@nostr-dev-kit/ndk-hooks';

function NoteFeed() {
  // there is no need to memoize filters
  // Subscribe to events matching the filter
  // `events` is a Set<NDKEvent> ordered by created_at (newest first by default)
  const { events, eose } = useSubscribe(
    [{ kinds: [NDKKind.Text] }], // no need to memoize filters, useSubscribe only depends on the explicit dependencies
    { /* in case you need to pass options for the subscription */ }, // NDKSubscriptionOptions
    [...dependencies] // in case you need to change the subscription
  );

  return (
    <div>
      <h3>Recent Notes</h3>
      {events.length === 0 && eose && <p>No notes found.</p>}
      <ul>
        {events.map((event: NDKEvent) => (
          <li key={event.id}>
            <p>{event.content}</p>
            <small>By: <UserProfileLink pubkey={event.pubkey} /></small>
            <small> At: {new Date(event.created_at! * 1000).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper component (replace with actual implementation)
function UserProfileLink({ pubkey }: { pubkey: string }) {
  const profile = useProfile(pubkey);
  return <span>{profile?.name || pubkey.substring(0, 8)}</span>;
}

export default NoteFeed;
```

## Other Useful Hooks

`ndk-hooks` provides several other specialized hooks:

*   `useFollows(pubkey)`: Fetches the follow list for a user.
*   `useMuteList(pubkey)`: Fetches the mute list for a user.
*   `useMuteFilter()`: Provides a filter function based on the current user's mute list.
*   `useNDKWallet()`: Manages wallet connections (e.g., NWC).
*   `useNDKNutzapMonitor()`: Monitors for incoming zaps via Nutzap.

Explore the exported hooks from `@nostr-dev-kit/ndk-hooks` for more advanced use cases.