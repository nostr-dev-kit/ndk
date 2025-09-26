# NDK React Hooks

`@nostr-dev-kit/ndk-hooks` provides a set of React hooks and utilities to seamlessly integrate Nostr functionality into your React applications using the Nostr Development Kit (NDK). This library simplifies managing Nostr data, user sessions, and event subscriptions within your React components.

## Initialization

The core of `ndk-hooks` revolves around a shared NDK instance. Initialize it once at the root of your application using the `useNDKInit` hook. This ensures all hooks and stores use the same NDK configuration.

```tsx
// components/ndk.tsx
'use client';

// Here we will initialize NDK and configure it to be available throughout the application
import NDK, { NDKNip07Signer, NDKPrivateKeySigner, NDKSigner } from "@nostr-dev-kit/ndk";

// An optional in-browser cache adapter
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";
import { NDKSessionLocalStorage, useNDKInit, useNDKSessionMonitor } from "@nostr-dev-kit/ndk-hooks";
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

// Connect to relays on initialization (client-side)
if (typeof window !== "undefined") ndk.connect();

// Use the browser's localStorage for session storage
const sessionStorage = new NDKSessionLocalStorage();

/**
 * Use an NDKHeadless component to initialize NDK in order to prevent application-rerenders
 * when there are changes to the NDK or session state.
 * 
 * Include this headless component in your app layout to initialize NDK correctly.
 * @returns 
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
import React, { useEffect } from 'react';
import { useNDKInit } from '@nostr-dev-kit/ndk-hooks';
import { NDKSessionLocalStorage, useNDKSessionMonitor } from '@nostr-dev-kit/ndk-hooks';
import YourMainApp from './YourMainApp'; // Your main application component
import NDKHeadless from "components/ndk.tsx";

function App() {
  return <ThemeProvider>
    <NDKHeadless />
    <YourMainApp />
  </ThemeProvider>
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

## Working with Users

### Using the `useUser` Hook

The `useUser` hook resolves various user identifier formats into an NDKUser instance:

```tsx
// Using hex pubkey
const user = useUser("abc123...");

// Using npub
const user = useUser("npub1...");

// Using nip05
const user = useUser("alice@example.com");

// Using nprofile
const user = useUser("nprofile1...");
```

### Fetching User Profiles

Easily fetch and display Nostr user profiles using the `useProfileValue` hook. It handles caching and fetching logic automatically.

The `useProfileValue` hook accepts two parameters:
- `userOrPubkey`: An NDKUser instance, public key string, null, or undefined
- `options`: An optional object with the following properties:
  - `refresh`: A boolean indicating whether to force a refresh of the profile
  - `subOpts`: NDKSubscriptionOptions to customize how the profile is fetched from relays

```tsx
// Basic usage with pubkey
const profile = useProfileValue(pubkey);

// Using with NDKUser from useUser hook
const user = useUser("alice@example.com");
const profile = useProfileValue(user);

// Force refresh the profile
const profile = useProfileValue(pubkey, { refresh: true });

// With subscription options
const profile = useProfileValue(user, {
  refresh: false,
  subOpts: {
    closeOnEose: true,
    // Other NDKSubscriptionOptions...
  }
});
```

The hook returns the user's profile (NDKUserProfile) or undefined if the profile is not available yet.

```tsx
// src/components/UserCard.tsx
import React from 'react';
import { useUser, useProfileValue } from '@nostr-dev-kit/ndk-hooks';

interface UserCardProps {
  userIdentifier: string; // Can be pubkey, npub, nip05, or nprofile
}

function UserCard({ userIdentifier }: UserCardProps) {
  // Resolve user from any identifier format
  const user = useUser(userIdentifier);

  // Fetch profile - will automatically fetch when user resolves
  const profile = useProfileValue(user, {
    refresh: false, // Whether to force a refresh of the profile
    subOpts: { /* NDKSubscriptionOptions */ } // Options for the subscription
  });

  if (!user) {
    return <div>Resolving user...</div>;
  }

  if (!profile) {
    return <div>Loading profile for {user.npub.substring(0, 12)}...</div>;
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

`ndk-hooks` provides robust session management, supporting both single and multiple user accounts. You can use the session monitoring functionality to automatically persist and restore user sessions across page reloads.

The session monitor will:
1. Automatically restore sessions from storage when your app loads
2. Persist new sessions when users log in
3. Update storage when sessions change
4. Remove sessions from storage when users log out

You can use this alongside the other session management hooks like `useNDKSessionLogin`, `useNDKSessionLogout`, and `useNDKSessionSwitch`.

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
  const profile = useProfileValue(pubkey, { refresh: true });
  return <span>{profile?.name || pubkey.substring(0, 8)}</span>;
}

export default NoteFeed;
```

### Fetching a Single Event with `useEvent`

The `useEvent` hook allows you to fetch a single event by its ID or using a filter. This is useful when you need to retrieve and display a specific event, such as an article, note, or any other Nostr content.

```tsx
// src/components/EventViewer.tsx
import React from 'react';
import { NDKEvent, NDKArticle } from '@nostr-dev-kit/ndk';
import { useEvent } from '@nostr-dev-kit/ndk-hooks';

function EventViewer({ eventId }: { eventId: string }) {
  // Fetch a single event by ID or filter
  // Returns undefined while loading, null if not found, or the event if found
  const event = useEvent<NDKArticle>(
    eventId,
    { wrap: true }, // Optional: UseSubscribeOptions
    [] // Optional: dependencies array
  );

  if (event === undefined) return <div>Loading event...</div>;
  if (event === null) return <div>Event not found</div>;

  return (
    <div>
      <h2>{event.title || 'Untitled'}</h2>
      <p>{event.content}</p>
      <small>Published: {new Date(event.created_at! * 1000).toLocaleString()}</small>
    </div>
  );
}

export default EventViewer;
```

The `useEvent` hook accepts three parameters:
- `idOrFilter`: A string ID, an NDKFilter object, or an array of NDKFilter objects to fetch the event
- `opts`: Optional UseSubscribeOptions to customize how the event is fetched
- `dependencies`: Optional array of dependencies that will trigger a refetch when changed

The hook returns:
- `undefined` while the event is being loaded
- `null` if the event was not found
- The event object if it was found

This makes it easy to handle loading states and display appropriate UI for each case.

## Other Useful Hooks

`ndk-hooks` provides several other specialized hooks:

*   `useFollows()`: Fetches the follow list of the active user.
*   `useNDKWallet()`: Manages wallet connections (e.g., NWC) (via `import of "@nostr-dev-kit/ndk-hooks/wallet"`)
*   `useNDKNutzapMonitor()`: Monitors for incoming zaps via Nutzap. (via `import of "@nostr-dev-kit/ndk-hooks/wallet"`)
## Muting

See [Muting Documentation](./muting.md) for details on how to mute, unmute, and check mute status for users, events, hashtags, and words using NDK React hooks.