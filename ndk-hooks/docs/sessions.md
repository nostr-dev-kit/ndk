# Session Management with `useNDKSessions`

The `@nostr-dev-kit/ndk-hooks` package provides a centralized system for managing user sessions and their associated signers within your React application. This system is built around the `useNDKSessions` Zustand store.

## Core Concepts

*   **Session:** Represents a logged-in user, identified by their public key (`pubkey`). A session can be active or inactive. Only one session can be active at a time.
*   **Signer:** An `NDKSigner` instance (e.g., `NDKPrivateKeySigner`, `NDKNip07Signer`, `NDKNip46Signer`) associated with a specific session's `pubkey`. A session might not have a signer initially (read-only mode).
*   **Active Session:** The session currently being used for operations like publishing events or fetching user-specific data (follows, mutes). The `ndk.activeUser` and `ndk.signer` properties reflect the active session.

## The `useNDKSessions` Store

This Zustand store holds the state for all managed sessions and signers. You typically don't interact with the store directly but use the exported functions to manage sessions.

**State:**

*   `sessions: Map<Hexpubkey, Session>`: A map of all known sessions, keyed by `pubkey`.
*   `signers: Map<Hexpubkey, NDKSigner>`: A map of available signers, keyed by `pubkey`.
*   `activeSessionPubkey: Hexpubkey | null`: The `pubkey` of the currently active session, or `null` if no session is active.

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

## Managing Sessions and Signers

The following functions are exported from `@nostr-dev-kit/ndk-hooks` to manage the session state:

### `addSigner(signer: NDKSigner, makeActive = true): Promise<Session | undefined>`

Adds a signer to the system. It implicitly starts a session for the signer's user if one doesn't exist.

*   **Purpose:** Used for logging in a user.
*   **Behavior:**
    1.  Retrieves the `NDKUser` associated with the `signer`.
    2.  Checks if a session for this user already exists.
    3.  If not, calls `startSession` to create a new session.
    4.  Adds the `signer` to the `signers` map.
    5.  If `makeActive` is `true` (default), calls `switchToUser` to make this session the active one.
*   **Returns:** A promise resolving to the `Session` object (new or existing) associated with the signer, or `undefined` if the signer's user couldn't be determined.

```tsx
import { addSigner } from "@nostr-dev-kit/ndk-hooks";
import { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

async function loginWithPrivateKey(nsec: string) {
    try {
        const signer = new NDKPrivateKeySigner(nsec);
        const session = await addSigner(signer); // Adds signer and makes the session active
        if (session) {
            console.log("Logged in:", session.pubkey);
        } else {
            console.error("Login failed.");
        }
    } catch (e) {
        console.error("Error creating signer:", e);
    }
}
```

### `startSession(pubkey: Hexpubkey, options?: SessionStartOptions): Promise<Session>`

Explicitly starts or retrieves a session for a given `pubkey`. Does **not** add a signer; use `addSigner` for that.

*   **Purpose:** To initialize a session, often for read-only access or before a signer is available (e.g., loading from storage).
*   **Behavior:**
    1.  Checks if a session for the `pubkey` already exists. If so, returns it.
    2.  If not, creates a new `Session` object.
    3.  Adds the session to the `sessions` map.
    4.  If `options.makeActive` is `true`, calls `switchToUser` to activate this session.
*   **Returns:** A promise resolving to the `Session` object (new or existing).

```tsx
import { startSession } from "@nostr-dev-kit/ndk-hooks";

async function viewProfile(pubkey: string) {
    // Start a session for the user, but don't make it active unless specified
    const session = await startSession(pubkey, { makeActive: false });
    console.log("Session started for:", session.pubkey);
    // Now you can potentially fetch profile data associated with this session
}
```

### `switchToUser(pubkey: Hexpubkey | ""): Promise<void>`

Activates the session associated with the given `pubkey`.

*   **Purpose:** To change the currently active user/signer.
*   **Behavior:**
    1.  Validates that the session for the `pubkey` exists (or clears the active session if `pubkey` is empty).
    2.  Updates `activeSessionPubkey` in the store.
    3.  Updates `ndk.activeUser` to the corresponding `NDKUser`.
    4.  Updates `ndk.signer` to the corresponding `NDKSigner` if available, otherwise sets it to `undefined`.
*   **Logout:** Calling `switchToUser("")` effectively logs the user out by clearing the active session, `ndk.activeUser`, and `ndk.signer`.

```tsx
import { switchToUser, useNDKSessions } from "@nostr-dev-kit/ndk-hooks";

function AccountSwitcher() {
    const sessionsMap = useNDKSessions(s => s.sessions);
    const sessions = Array.from(sessionsMap.values());

    const handleSwitch = (pubkey: string) => {
        switchToUser(pubkey);
    };

    const handleLogout = () => {
        switchToUser(""); // Logout
    };

    return (
        <div>
            {sessions.map(session => (
                <button key={session.pubkey} onClick={() => handleSwitch(session.pubkey)}>
                    Switch to {session.pubkey.substring(0, 8)}
                </button>
            ))}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
```

### `removeSigner(pubkey: Hexpubkey): Promise<void>`

Removes only the signer associated with a `pubkey`, leaving the session intact (making it read-only).

*   **Purpose:** To "forget" the signing capability for a user without removing their session data entirely.
*   **Behavior:**
    1.  Removes the signer from the `signers` map.
    2.  If the removed signer belonged to the currently active session, it also clears `ndk.signer`.

### `removeSession(pubkey: Hexpubkey): Promise<void>`

Removes both the session and its associated signer (if any).

*   **Purpose:** To completely remove a user account from the application's state.
*   **Behavior:**
    1.  Calls `removeSigner` for the `pubkey`.
    2.  Removes the session from the `sessions` map.
    3.  If the removed session was the active one, it calls `switchToUser("")` to log out.

### `stopSession(pubkey: Hexpubkey): Promise<void>`

Currently, this function primarily ensures the session exists but doesn't perform significant cleanup specific to stopping. Its role might evolve. Use `removeSession` or `switchToUser("")` for logging out or removing accounts.

## Integration with NDKProvider

Ensure your application is wrapped with `<NDKProvider ndk={yourNdkInstance}>`. The session management functions rely on accessing the `NDK` instance provided by this context.

## Persistence (ndk-mobile)

While `ndk-hooks` manages the in-memory state, persistence (saving/loading sessions and signers across app restarts) is handled by platform-specific packages like `@nostr-dev-kit/ndk-mobile`. See the `ndk-mobile` documentation for details on `useSessionMonitor` and `bootNDK`.