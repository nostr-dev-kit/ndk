# Session Management with `useNDKSessions`

The `@nostr-dev-kit/ndk-hooks` package provides a centralized system for managing user sessions and their associated data within your React application. This system is built around the `useNDKSessions` Zustand store, which now manages its own NDK instance internally.

## Core Concepts

*   **Session:** Represents a logged-in user, identified by their public key (`pubkey`). A session can be active or inactive. Only one session can be active at a time.
*   **Signer:** An `NDKSigner` instance (e.g., `NDKPrivateKeySigner`, `NDKNip07Signer`, `NDKNip46Signer`) associated with a specific session's `pubkey`. A session might not have a signer initially (read-only mode).
*   **Active Session:** The session currently being used for operations like publishing events or fetching user-specific data (follows, mutes). The `ndk.activeUser` and `ndk.signer` properties reflect the active session.

## The `useNDKSessions` Store

This Zustand store holds the state for all managed sessions and their data. The store now initializes and manages its own NDK instance, which simplifies integration and usage. You typically don't interact with the store directly but use the exported functions to manage sessions.

**State:**

*   `ndk: NDK | undefined`: The NDK instance used by the session store.
*   `sessions: Map<string, UserSessionData>`: A map of all known sessions, keyed by `pubkey`.
*   `activeSessionPubkey: string | null`: The `pubkey` of the currently active session, or `null` if no session is active.

**Accessing State (Example):**

While direct access is less common, you can select parts of the state if needed:

```tsx
import { useNDKSessions } from "@nostr-dev-kit/ndk-hooks";
import { NDKUser } from "@nostr-dev-kit/ndk";

function SessionList() {
    const sessionsMap = useNDKSessions(s => s.sessions);
    const activePubkey = useNDKSessions(s => s.activeSessionPubkey);
    const sessions = Array.from(sessionsMap.values());

    return (
        <ul>
            {sessions.map(session => (
                <li key={session.pubkey} style={{ fontWeight: session.pubkey === activePubkey ? 'bold' : 'normal' }}>
                    {/* Assuming you have a way to get profile info */}
                    {session.pubkey.substring(0, 10)}...
                    {session.pubkey === activePubkey ? ' (Active)' : ''}
                </li>
            ))}
        </ul>
    );
}
```

## Initializing the NDK Instance

Before using any session management functions, you must initialize the NDK instance in the store using the `useNDKInit` hook:

```tsx
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
            
            // Initialize the NDK instance in the session store
            initializeNDK(ndkInstance);
        };
        
        setupNDK();
    }, [initializeNDK]);
    
    return (
        // Your app components
    );
}
```

The `useNDKInit` function initializes the NDK instance in the session store and any other stores that depend on the NDK instance.

## Managing Sessions

The following functions are exported from the session store to manage sessions:

### `initSession(user: NDKUser, signer?: NDKSigner, opts?: SessionInitOptions): Promise<string | undefined>`

Initializes a session for a Nostr user. This is the primary function for setting up a user session.

* **Purpose:** Used for creating or updating a user's session with their profile, follows, and other data.
* **Behavior:**
  1. Creates a new session entry in the store if one doesn't exist for the given `pubkey`.
  2. Associates the provided `NDKSigner` (if any) with the session.
  3. Optionally sets the session as active based on `opts.autoSetActive`.
  4. Creates a persistent subscription to fetch and keep updated the user's profile, follow list, mute list, and any additional kinds specified in `opts.events`.
  5. Uses the modern NDK subscription pattern with `onEvent`, `onEvents`, and `onEose` handlers.
* **Returns:** A promise resolving to the user's pubkey if successful, or `undefined` if initialization failed.

```tsx
import { useNDKSessions } from "@nostr-dev-kit/ndk-hooks";
import { NDKNip07Signer } from "@nostr-dev-kit/ndk";

async function loginWithNip07() {
    try {
        const signer = new NDKNip07Signer();
        const user = await signer.user();
        
        const initSession = useNDKSessions.getState().initSession;
        
        const options = {
            profile: true,
            follows: true,
            muteList: true,
            autoSetActive: true,
        };
        
        // Notice: No NDK instance is passed
        const pubkey = await initSession(user, signer, options);
        
        if (pubkey) {
            console.log(`Session initialized for: ${pubkey}`);
        } else {
            console.error("Session initialization failed");
        }
    } catch (e) {
        console.error("Login error:", e);
    }
}
```

### `deleteSession(pubkey: string): void`

Removes a session from the store.

* **Purpose:** Used for logging out or removing a user's data.
* **Behavior:** Removes the session entry from the `sessions` map.

### `setActiveSession(pubkey: string | null): void`

Sets the active session or clears it if `null` is provided.

* **Purpose:** Used to switch between different user sessions.
* **Behavior:** Updates the `activeSessionPubkey` in the store.

```tsx
import { useNDKSessions } from "@nostr-dev-kit/ndk-hooks";

function AccountSwitcher() {
    const sessionsMap = useNDKSessions(state => state.sessions);
    const activePubkey = useNDKSessions(state => state.activeSessionPubkey);
    const setActiveSession = useNDKSessions.getState().setActiveSession;
    
    const sessions = Array.from(sessionsMap.values());
    
    const handleSwitch = (pubkey: string) => {
        setActiveSession(pubkey);
    };
    
    const handleLogout = () => {
        setActiveSession(null); // Clear active session
    };
    
    return (
        <div>
            {sessions.map(session => (
                <button
                    key={session.pubkey}
                    onClick={() => handleSwitch(session.pubkey)}
                    style={{ fontWeight: session.pubkey === activePubkey ? 'bold' : 'normal' }}
                >
                    Switch to {session.pubkey.substring(0, 8)}
                </button>
            ))}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
```

### `muteItemForSession(pubkey: string, value: string, itemType: 'pubkey' | 'hashtag' | 'word' | 'event', publish?: boolean): void`

Adds an item to a session's mute list.

* **Purpose:** Used to mute users, hashtags, words, or events.
* **Behavior:** Updates the appropriate mute set in the session and optionally publishes a new mute list event.

## Modern Subscription Pattern

The session store now uses the modern NDK subscription pattern internally:

```typescript
// Example of the pattern used in setupEventSubscription
const subscription = ndk.subscribe(
    filter,
    { closeOnEose: false }, // Options object
    { // Callbacks object
        onEvent: (event: NDKEvent) => {
            // Handle single events as they arrive
            handleEventUpdate(event);
        },
        onEvents: (events: NDKEvent[]) => {
            // Handle multiple events, typically from cache
            for (const event of events) {
                handleEventUpdate(event);
            }
        },
        onEose: () => {
            // Handle end-of-stored-events signal
            console.log("Received all initial events");
        }
    }
);
// The subscription starts automatically
```

This pattern provides more flexibility and better handling of cached events.

## Integration with React Applications

The session store is designed to work seamlessly with React applications. You don't need to wrap your app in a provider, as Zustand handles state management globally.

## Persistence

While `ndk-hooks` manages the in-memory state, persistence (saving/loading sessions across app restarts) is typically handled by platform-specific implementations. For example, `@nostr-dev-kit/ndk-mobile` provides utilities for persisting sessions on mobile devices.