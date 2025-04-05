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

function App() {
  const initializeNDK = useNDKInit();

  useEffect(() => {
    const setupNDK = async () => {
      // Connect NDK instance
      await ndkInstance.connect();

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
  const profile = useProfile(pubkey /*, true */);

  if (!profile) {
    return <div>Loading profile for {pubkey.substring(0, 8)}...</div>;
  }

  return (
    <div>
      <img
        src={profile.image || profile.picture || '/default-avatar.png'} // Handle different profile image fields
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

### Current User

Use `useNDKCurrentUser` to get and set the globally active user. This is suitable for applications with a single logged-in user at a time.

```tsx
// src/components/AuthStatus.tsx
import React from 'react';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import NDK, { NDKUser, NDKNip07Signer } from '@nostr-dev-kit/ndk';

function AuthStatus() {
  const { currentUser, setCurrentUser } = useNDKCurrentUser();
  const { ndk } = useNDK(); // Get NDK instance if needed for login logic

  const handleLogin = async () => {
    if (!ndk) return;
    try {
      // Example using NIP-07 (browser extension)
      const nip07signer = new NDKNip07Signer();
      const user = await nip07signer.user(); // Prompts user for permission
      user.ndk = ndk; // Associate user with NDK instance
      await user.fetchProfile(); // Fetch profile data
      setCurrentUser(user); // Set as the current user
      console.log(`Logged in as ${user.npub}`);

      // If using multi-account sessions, initialize it here too
      // const { initSession } = useNDKSessions.getState();
      // initSession(user, nip07signer);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // Also clear active session if using multi-account
    // const { setActiveSession } = useNDKSessions.getState();
    // setActiveSession(null);
  };

  if (!currentUser) {
    return <button onClick={handleLogin}>Login with NIP-07</button>;
  }

  return (
    <div>
      <p>Logged in as: {currentUser.profile?.name || currentUser.npub}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default AuthStatus;

```

### Multi-Account Sessions (`useNDKSessions`)

For applications needing to manage multiple user accounts simultaneously (e.g., account switching), use the `useNDKSessions` store and related hooks like `useUserSession` and `useAvailableSessions`.

1.  **Initialize Sessions:** When a user logs in, initialize their session.
2.  **Set Active Session:** Designate one session as active. `useNDKCurrentUser` often reflects the user of the *active* session.
3.  **Access Session Data:** Use `useUserSession` to get data specific to a session (active or by pubkey).

```tsx
// src/components/AccountSwitcher.tsx
import React from 'react';
import {
  useNDKSessions,
  useAvailableSessions,
  useUserSession,
} from '@nostr-dev-kit/ndk-hooks';
import { NDKUser, NDKSigner } from '@nostr-dev-kit/ndk';

// Assume login logic similar to AuthStatus, but uses initSession
// function handleLoginAndInitSession(user: NDKUser, signer: NDKSigner) {
//   const { initSession, setActiveSession } = useNDKSessions.getState();
//   initSession(user, signer);
//   setActiveSession(user.pubkey); // Make the new session active
// }

function AccountSwitcher() {
  const availableSessions = useAvailableSessions(); // Get pubkeys of all initialized sessions
  const { activeSessionPubkey, setActiveSession, deleteSession } = useNDKSessions();

  const handleSwitch = (pubkey: string) => {
    setActiveSession(pubkey);
  };

  const handleDelete = (pubkey: string) => {
    deleteSession(pubkey);
    // If deleting the active session, set active to null or another session
    if (activeSessionPubkey === pubkey) {
      setActiveSession(availableSessions.find(p => p !== pubkey) || null);
    }
  };

  return (
    <div>
      <h4>Available Accounts:</h4>
      {availableSessions.length === 0 && <p>No accounts logged in.</p>}
      <ul>
        {availableSessions.map((pubkey) => (
          <li key={pubkey} style={{ fontWeight: activeSessionPubkey === pubkey ? 'bold' : 'normal' }}>
            <AccountInfo pubkey={pubkey} />
            <button onClick={() => handleSwitch(pubkey)} disabled={activeSessionPubkey === pubkey}>
              Switch To
            </button>
            <button onClick={() => handleDelete(pubkey)}>Logout</button>
          </li>
        ))}
      </ul>
      {/* Add button/logic here to trigger login (handleLoginAndInitSession) */}
    </div>
  );
}

// Helper component to display info for a session
function AccountInfo({ pubkey }: { pubkey: string }) {
  const session = useUserSession(pubkey); // Get specific session data
  const profile = useProfile(pubkey); // Fetch profile for display

  if (!session) return <span>Loading session...</span>;

  return (
    <span>
      {profile?.name || pubkey.substring(0, 8)} ({session.signer?.type || 'No Signer'})
    </span>
  );
}

export default AccountSwitcher;
```

## Subscribing to Events

Use the `useSubscribe` hook for subscribing to Nostr events based on filters. It returns the events found in a stable set.

```tsx
// src/components/NoteFeed.tsx
import React, { useState } from 'react';
import { NDKFilter, NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { useSubscribe } from '@nostr-dev-kit/ndk-hooks';

function NoteFeed() {
  const [filter, setFilter] = useState<NDKFilter>({
    kinds: [NDKKind.Text], // Kind 1 for short text notes
    limit: 20,
  });

  // Subscribe to events matching the filter
  // `events` is a Set<NDKEvent> ordered by created_at (newest first by default)
  const { events, eose } = useSubscribe(filter, {
    closeOnEose: false, // Keep subscription open for new events
    autoStart: true,    // Start subscription immediately
  }, [...dependencies]);

  return (
    <div>
      <h3>Recent Notes</h3>
      {!eose && <p>Loading initial notes...</p>}
      {events.size === 0 && eose && <p>No notes found.</p>}
      <ul>
        {Array.from(events).map((event: NDKEvent) => (
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