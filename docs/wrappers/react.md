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

## Fetching User Profiles

Easily fetch and display Nostr user profiles using the `useProfileValue` hook. It handles caching and fetching logic automatically.

```tsx
// src/components/UserCard.tsx
import React from 'react';
import { useProfileValue } from '@nostr-dev-kit/ndk-hooks';

interface UserCardProps {
  pubkey: string;
}

function UserCard({ pubkey }: UserCardProps) {
  // Fetch profile, force refresh by passing `true` as second argument
  const profile = useProfileValue(pubkey);

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
  const profile = useProfileValue(pubkey);
  return <span>{profile?.name || pubkey.substring(0, 8)}</span>;
}

export default NoteFeed;
```

## Other Useful Hooks

`ndk-hooks` provides several other specialized hooks:

*   `useFollows(pubkey)`: Fetches the follow list for a user.
*   `useNDKWallet()`: Manages wallet connections (e.g., NWC) (via `import of "@nostr-dev-kit/ndk-hooks/wallet"`)
*   `useNDKNutzapMonitor()`: Monitors for incoming zaps via Nutzap. (via `import of "@nostr-dev-kit/ndk-hooks/wallet"`)

## Muting Users, Hashtags, Words, and Events

NDK React hooks provide a simple way to mute users, hashtags, words, or specific events for the current session using the `useMuteItem` hook. Muting is session-specific and updates the Nostr mute list (kind 10000 event) for the active user.

### Mute Hooks

NDK React hooks provide a simple way to work with mutes without having to interact with the underlying store implementation. The following hooks are available:

- `useMuteList()`: Returns the mute list data for the active user, including sets of muted pubkeys, hashtags, words, event IDs, and the raw mute list event.
- `useMuteFilter()`: Returns a function that checks if an event is muted for the active user.
- `useMuteItem()`: Returns a function that mutes an item for the current user.
- `useUnmuteItem()`: Returns a function that unmutes an item for the current user.
- `useIsItemMuted()`: Returns whether an item is muted for the current user.

All the internal details like initializing mutes, loading mute lists, setting active pubkeys, and publishing mute lists are handled automatically by the library when you use these hooks. The mute store is automatically synchronized with the session store, so you don't need to worry about keeping them in sync.

> **Best Practice**: Always use the provided hooks to interact with the mute functionality. Direct access to the underlying stores is not recommended and may lead to synchronization issues.

### Muting with `useMuteItem`

The `useMuteItem` hook returns a function you can call with a user, hashtag, word, or event to mute it. The hook automatically determines the type and updates the mute list accordingly.

```tsx
import { useMuteItem } from '@nostr-dev-kit/ndk-hooks';
import { NDKUser, NDKEvent } from '@nostr-dev-kit/ndk';

function MuteExample({ user, event }: { user: NDKUser; event: NDKEvent }) {
  const muteItem = useMuteItem();

  // Mute a user
  const handleMuteUser = () => muteItem(user);

  // Mute a hashtag
  const handleMuteHashtag = () => muteItem('#nostr');

  // Mute a word
  const handleMuteWord = () => muteItem('spam');

  // Mute an event
  const handleMuteEvent = () => muteItem(event);

  return (
    <div>
      <button onClick={handleMuteUser}>Mute User</button>
      <button onClick={handleMuteHashtag}>Mute #nostr</button>
      <button onClick={handleMuteWord}>Mute "spam"</button>
      <button onClick={handleMuteEvent}>Mute Event</button>
    </div>
  );
}
```

- **User:** Pass an `NDKUser` instance to mute a user by pubkey.
- **Hashtag:** Pass a string starting with `#` (e.g., `#nostr`) to mute a hashtag.
- **Word:** Pass a string (e.g., `spam`) to mute a word.
- **Event:** Pass an `NDKEvent` instance to mute a specific event by ID.

### Notes
- Muting is persisted as a Nostr kind 10000 event and will be respected by all NDK-powered clients that support mute lists.
- The mute list is automatically updated and published for the active session.
- Use `useMuteFilter()` to filter events in your UI based on the mute list.

Explore the exported hooks from `@nostr-dev-kit/ndk-hooks` for more advanced use cases.