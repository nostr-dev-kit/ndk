# NDK Hooks: Multi-User Session Management

This document explains how to use the Zustand-based multi-user session management system provided by `ndk-hooks`. It allows you to manage user data (profiles, follows, mutes), and events for multiple Nostr users concurrently within your React application.

## Core Concept

The session management relies on a central Zustand store accessed via the `useNDKSessions` hook. This store maintains a map of user sessions, keyed by the user's public key (`pubkey`). It also tracks which session is currently "active".

## Setup

No explicit setup like wrapping your app in a Provider is needed, as Zustand handles state management globally.

## Importing

```typescript
import {
    useNDKSessions,
    useUserSession, // Optional selector hook for active or specific session
} from "@nostr-dev-kit/ndk-hooks/session"; // Adjust path as needed

// Import types if necessary
import type { UserSessionData, SessionInitOptions } from "@nostr-dev-kit/ndk-hooks/session";
import type NDK from "@nostr-dev-kit/ndk";
import type { NDKUser, NDKKind, NDKList, NDKSimpleGroupList, NDKSigner } from "@nostr-dev-kit/ndk"; // Added NDKSigner
```

## Initializing a Session
Before interacting with a user's data, you need to initialize the NDK instance and then initialize the user's session. The store now manages its own NDK instance internally, so you don't need to pass it to each function.

```typescript
import { useNDKSessions, useNDKInit } from "@nostr-dev-kit/ndk-hooks";
import NDK from "@nostr-dev-kit/ndk";
import { NDKNip07Signer } from "@nostr-dev-kit/ndk"; // Example signer

// Example: Initialize session after NIP-07 login
async function loginAndInitSession() {
    try {
        // First, initialize the NDK instance
        const ndkInstance = new NDK({ explicitRelayUrls: ["wss://relay.example.com"] });
        await ndkInstance.connect();
        
        // Initialize the NDK instance in the store
        const initializeNDK = useNDKInit();
        initializeNDK(ndkInstance);
        
        // Now get the initSession action from the store
        const initSession = useNDKSessions.getState().initSession;
        
        const nip07Signer = new NDKNip07Signer();
        const user = await nip07Signer.user(); // Gets NDKUser

        const options: SessionInitOptions = {
            profile: true, // Fetch user profile (default: true) - Renamed from fetchProfiles
            follows: true, // Fetch user's follow list - Renamed from fetchFollows
            muteList: true, // Fetch user's mute list - Renamed from fetchMuteList
            autoSetActive: true, // Make this session active immediately (default: true)
            // NEW: Specify additional replaceable events to fetch and optionally wrap
            events: new Map([
                [NDKKind.SimpleGroupList, { wrap: NDKSimpleGroupList }], // Fetch Kind 10009, wrap with NDKSimpleGroupList
                [NDKKind.BlossomList, { wrap: NDKList }], // Fetch Kind 10050, wrap with NDKList
                // Add other kinds as needed
            ])
        };

        // Notice: No need to pass the NDK instance to initSession
        const initializedPubkey = await initSession(user, nip07Signer, options);

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

The `initSession(user, signer?, opts?)` action performs the following:
1.  Creates a new session entry in the store if one doesn't exist for the given `pubkey`.
2.  Uses the NDK instance from the store that was initialized with `useNDKInit`.
3.  **Associates the provided `NDKSigner` (if any) with the session.** This allows hooks like `useMuteItem` to publish signed events using the correct signer for the session.
4.  Optionally sets the session as active based on `opts.autoSetActive`.
5.  Creates a persistent subscription to fetch and keep updated the user's profile, follow list, mute list, and any additional kinds specified in `opts.events`.
6.  Uses the modern NDK subscription pattern with `onEvent`, `onEvents` (for cached events), and `onEose` handlers.
7.  Stores these replaceable events in the `session.replaceableEvents` map, automatically wrapping them with specified classes if provided.
8.  Updates derived state like `session.followSet` and `session.muted*` sets based on the received events.

**Note for App Developers:** You must initialize the NDK instance in the store using `useNDKInit` before calling `initSession`. Passing the `signer` to `initSession` is the recommended way to associate a signer with a user's session data. The session store now manages its own NDK instance, which simplifies the API and ensures consistency across different parts of your application.

## Accessing Session State

You can access the entire state or specific parts using the `useNDKSessions` hook directly or via provided selector hooks.

### Getting the Active Session (or a Specific Session)

The `useUserSession` hook provides a convenient way to access session data.

**Getting the Active Session:**

Call the hook without arguments to get the currently active session.

```typescript
import { useUserSession } from "@nostr-dev-kit/ndk-hooks/session";

function UserDisplay() {
    const activeSession = useUserSession(); // Returns UserSessionData | undefined for the active user

    if (!activeSession) {
        return <div>No active session. Please log in.</div>;
    }

    return (
        <div>
            <h2>Active User: {activeSession.profile?.displayName || activeSession.userPubkey}</h2>
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

**Getting a Specific Session by Pubkey:**

Pass the desired `pubkey` as an argument to the hook.

```typescript
import { useUserSession } from "@nostr-dev-kit/ndk-hooks/session";

function SpecificUserProfile({ pubkey }: { pubkey: string }) {
    const session = useUserSession(pubkey); // Returns UserSessionData | undefined for the specified pubkey

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
### Accessing Replaceable Events (`useNDKSessionEvent`)

For accessing specific replaceable events (like Kind 0, 3, 10000, or custom kinds fetched via `initSession`'s `events` option), use the `useNDKSessionEvent` hook.

```typescript
import { useNDKSessionEvent } from "@nostr-dev-kit/ndk-hooks/session";
import { NDKKind, NDKList } from "@nostr-dev-kit/ndk";

function MyBlossomComponent() {
    // Get the BlossomList (Kind 30001) for the active user
    // If it doesn't exist in the session state yet, create a new default NDKList instance
    const blossomList = useNDKSessionEvent<NDKList>(NDKKind.BlossomList, { create: NDKList });

    if (!blossomList) {
        // Still loading from network or NDK instance not ready for creation
        return <div>Loading Blossom List...</div>;
    }

    // Use the blossomList instance (either fetched or newly created)
    // Note: If created, it's not automatically saved/published.
    console.log("Blossom List Pubkey:", blossomList.pubkey);
    // ... render list items or provide editing UI ...

    return (
        <div>
            {/* Display Blossom List content */}
        </div>
    );
}
```

This hook simplifies accessing potentially wrapped event objects stored in the session's `replaceableEvents` map. The `create` option is useful for providing a default, usable object immediately, even before the actual event is fetched from relays.

## Initializing the NDK Instance

Before using any of the session management features, you need to initialize the NDK instance in the store. This is done using the `useNDKInit` hook:

```typescript
import { useNDKInit } from "@nostr-dev-kit/ndk-hooks";
import NDK from "@nostr-dev-kit/ndk";

function App() {
    const initializeNDK = useNDKInit();
    
    useEffect(() => {
        const setupNDK = async () => {
            const ndkInstance = new NDK({
                explicitRelayUrls: ["wss://relay.example.com"]
            });
            await ndkInstance.connect();
            
            // Initialize the NDK instance in the session store and other stores
            initializeNDK(ndkInstance);
            
            console.log("NDK initialized in stores");
        };
        
        setupNDK();
    }, [initializeNDK]);
    
    return (
        // Your app components...
    );
}
```

The `useNDKInit` hook returns a function that initializes the NDK instance in:
1. The session store (`useNDKSessions`)
2. Any other stores that depend on the NDK instance

This centralized initialization ensures that all components and hooks have access to the same NDK instance.

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
                    {session.profile?.name || session.userPubkey.substring(0, 8)}
                </option>
            ))}
        </select>
    );
}
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

### Muting Items

The store provides a low-level action `muteItemForSession` which takes the pubkey, value, item type, and publish flag.

```typescript
const muteItemForSession = useNDKSessions.getState().muteItemForSession;
// muteItemForSession(activePubkey, event.id, "event", true);
```

For convenience within components, the `useMuteItem` hook is provided:

```typescript
import { useMuteItem } from "@nostr-dev-kit/ndk-hooks/session"; // Or main index
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";

function MuteControls({ eventToMute, userToMute }: { eventToMute: NDKEvent, userToMute: NDKUser }) {
    // Get the mute function for the active session.
    // Optional boolean argument controls if the updated mute list is published (default: true).
    const mute = useMuteItem(true);

    const handleMuteEvent = () => mute(eventToMute);
    const handleMuteUser = () => mute(userToMute);
    const handleMuteHashtag = () => mute("#nostr"); // Mutes hashtag 'nostr'
    const handleMuteWord = () => mute("spam"); // Mutes word 'spam'

    return (
        <div>
            <button onClick={handleMuteEvent}>Mute Event {eventToMute.id.substring(0,6)}</button>
            <button onClick={handleMuteUser}>Mute User {userToMute.pubkey.substring(0,6)}</button>
            <button onClick={handleMuteHashtag}>Mute #nostr</button>
            <button onClick={handleMuteWord}>Mute "spam"</button>
        </div>
    );
}
```

The `useMuteItem` hook returns a function that accepts:
- An `NDKEvent`: Mutes the event ID.
- An `NDKUser`: Mutes the user's pubkey.
- A `string`: If it starts with `#`, mutes the hashtag (excluding the `#`). Otherwise, mutes the string as a word.

Calling the returned function triggers the `muteItemForSession` action for the active user, performing an optimistic update and publishing the new mute list event (if configured).

## Available State and Actions

Refer to `ndk-hooks/src/session/types.ts` for the full `SessionState` interface, which details all available state properties (like `sessions`, `activeSessionPubkey`) and action signatures.

## Modern Subscription Pattern

The session store now uses the modern NDK subscription pattern with callbacks for handling events:

```typescript
// Example of the modern subscription pattern used internally
const subscription = ndk.subscribe(
    filter,
    { closeOnEose: false }, // Options object
    { // Callbacks object
        onEvent: (event: NDKEvent) => {
            // Handle a single event as it arrives
            handleEventUpdate(event);
        },
        onEvents: (events: NDKEvent[]) => {
            // Handle multiple events, typically from cache
            for (const event of events) {
                handleEventUpdate(event);
            }
        },
        onEose: () => {
            // Handle end-of-stored-events
            console.log("All events received from relays");
        }
    }
);
// The subscription starts automatically with the new pattern
```

This pattern provides more flexibility and better handling of cached events compared to the previous approach.

## Utility Functions

-   `processMuteList(muteListEvent: NDKEvent)`: Parses a kind 10000 event's tags into structured mute sets. Located in `ndk-hooks/src/session/utils.ts`.