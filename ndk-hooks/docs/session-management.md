# NDK Hooks: Multi-User Session Management

This document explains how to use the Zustand-based multi-user session management system provided by `ndk-hooks`. It allows you to manage NDK instances, user data (profiles, follows, mutes), and events for multiple Nostr users concurrently within your React application.

## Core Concept

The session management relies on a central Zustand store accessed via the `useNDKSessions` hook. This store maintains a map of user sessions, keyed by the user's public key (`pubkey`). It also tracks which session is currently "active".

## Setup

No explicit setup like wrapping your app in a Provider is needed, as Zustand handles state management globally.

## Importing

```typescript
import {
    useNDKSessions,
    useSession, // Optional selector hook
    useActiveSessionData, // Optional selector hook
} from "@nostr-dev-kit/ndk-hooks/session"; // Adjust path as needed

// Import types if necessary
import type { UserSessionData, SessionInitOptions } from "@nostr-dev-kit/ndk-hooks/session";
import type NDK from "@nostr-dev-kit/ndk";
import type { NDKUser } from "@nostr-dev-kit/ndk";
```

## Initializing a Session

Before interacting with a user's data, you need to initialize their session. This typically involves providing an `NDK` instance and the `NDKUser` object.

```typescript
import { useNDKSessions } from "@nostr-dev-kit/ndk-hooks/session";
import NDK from "@nostr-dev-kit/ndk";
import { NDKNip07Signer } from "@nostr-dev-kit/ndk"; // Example signer

// Assume you have an NDK instance configured
const ndkInstance = new NDK({ explicitRelayUrls: ["wss://relay.example.com"] });
await ndkInstance.connect();

// Get the initSession action from the store
const initSession = useNDKSessions.getState().initSession;

// Example: Initialize session after NIP-07 login
async function loginAndInitSession() {
    try {
        const nip07Signer = new NDKNip07Signer();
        const user = await nip07Signer.user(); // Gets NDKUser
        ndkInstance.signer = nip07Signer; // Assign signer to NDK

        const options: SessionInitOptions = {
            fetchProfiles: true, // Fetch user profile (default: true)
            fetchFollows: true, // Fetch user's follow list
            fetchMuteList: true, // Fetch user's mute list
            autoSetActive: true, // Make this session active immediately (default: true)
        };

        const initializedPubkey = await initSession(ndkInstance, user, options);

        if (initializedPubkey) {
            console.log(`Session initialized and active for pubkey: ${initializedPubkey}`);
        } else {
            console.error("Session initialization failed.");
        }
    } catch (error) {
        console.error("Login or initialization error:", error);
    }
}

loginAndInitSession();
```

The `initSession` action performs the following:
1.  Creates a new session entry in the store if one doesn't exist for the given `pubkey`.
2.  Associates the provided `NDK` instance with the session.
3.  Optionally sets the session as active.
4.  Optionally fetches the user's profile, follow list, and mute list in parallel.
5.  Updates the session state with the fetched data.

## Accessing Session State

You can access the entire state or specific parts using the `useNDKSessions` hook directly or via provided selector hooks.

### Getting the Active Session

```typescript
import { useActiveSessionData } from "@nostr-dev-kit/ndk-hooks/session";

function UserDisplay() {
    const activeSession = useActiveSessionData(); // Returns UserSessionData | undefined

    if (!activeSession) {
        return <div>No active session. Please log in.</div>;
    }

    return (
        <div>
            <h2>Active User: {activeSession.metadata?.displayName || activeSession.userPubkey}</h2>
            <p>Last Active: {new Date(activeSession.lastActive).toLocaleString()}</p>
            {/* Display other session data */}
        </div>
    );
}
```
Alternatively, access via the main hook:
```typescript
const activeSession = useNDKSessions(state => state.getActiveSession());
```

### Getting a Specific Session by Pubkey

```typescript
import { useSession } from "@nostr-dev-kit/ndk-hooks/session";

function SpecificUserProfile({ pubkey }: { pubkey: string }) {
    const session = useSession(pubkey); // Returns UserSessionData | undefined

    if (!session) {
        return <div>Session data not loaded for {pubkey}.</div>;
    }
    // ... display session data
}
```
Alternatively:
```typescript
const session = useNDKSessions(state => state.getSession(pubkey));
```

### Getting All Sessions

```typescript
const allSessionsMap = useNDKSessions(state => state.sessions);
const allSessionsArray = Array.from(allSessionsMap.values());
```

## Modifying Session State

Actions to modify the state are accessed via `useNDKSessions.getState()`.

### Switching the Active Session

```typescript
const setActiveSession = useNDKSessions.getState().setActiveSession;

function SessionSwitcher() {
    const sessions = useNDKSessions(state => Array.from(state.sessions.values()));
    const activePubkey = useNDKSessions(state => state.activeSessionPubkey);

    return (
        <select
            value={activePubkey ?? ""}
            onChange={(e) => setActiveSession(e.target.value || null)}
        >
            <option value="">-- Select User --</option>
            {sessions.map(session => (
                <option key={session.userPubkey} value={session.userPubkey}>
                    {session.metadata?.name || session.userPubkey.substring(0, 8)}
                </option>
            ))}
        </select>
    );
}
```

### Creating a Session Manually (Less Common)

Usually, `initSession` handles creation.

```typescript
const createSession = useNDKSessions.getState().createSession;
// createSession(newPubkey, { /* initial partial data */ });
```

### Updating Session Data

```typescript
const updateSession = useNDKSessions.getState().updateSession;
// updateSession(pubkey, { relays: ["wss://new.relay.com"] });
```

### Deleting a Session

```typescript
const deleteSession = useNDKSessions.getState().deleteSession;

function LogoutButton({ pubkey }: { pubkey: string }) {
    const handleLogout = () => {
        // Perform any other logout logic (e.g., disconnect NDK)
        deleteSession(pubkey);
    };
    return <button onClick={handleLogout}>Log Out {pubkey.substring(0, 6)}</button>;
}
```

### Adding Events (Removed)

*Note: The `addEventToSession` action and the general-purpose `events` map within the session state have been removed. Storing arbitrary events keyed by kind within the session proved brittle. Use dedicated hooks (like `useSubscribe`) or separate stores tailored to specific event kinds (e.g., a store for user profiles, a store for contacts) to manage event data.*

### Muting Items

```typescript
const muteItemForSession = useNDKSessions.getState().muteItemForSession;

function MuteButton({ itemToMute, itemType, sessionPubkey }: { /* ... */ }) {
    const handleMute = () => {
        // The `publish` flag (optional, default true) determines if a new
        // kind 10000 event should be published. Publishing is NOT YET IMPLEMENTED.
        muteItemForSession(sessionPubkey, itemToMute, itemType, false);
    };
    // ...
}
```

### Setting the Mute List from an Event

```typescript
import { type NDKEvent } from "@nostr-dev-kit/ndk";
const setMuteListForSession = useNDKSessions.getState().setMuteListForSession;

function processFetchedMuteList(muteListEvent: NDKEvent, targetPubkey: string) {
    setMuteListForSession(targetPubkey, muteListEvent);
}
```

## Available State and Actions

Refer to `ndk-hooks/src/session/types.ts` for the full `SessionState` interface, which details all available state properties (like `sessions`, `activeSessionPubkey`) and action signatures.

## Utility Functions

-   `processMuteList(muteListEvent: NDKEvent)`: Parses a kind 10000 event's tags into structured mute sets. Located in `ndk-hooks/src/session/utils.ts`.