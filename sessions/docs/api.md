# API Reference

Complete API documentation for `@nostr-dev-kit/sessions`.

## NDKSessionManager

The main class for managing user sessions.

### Constructor

```typescript
new NDKSessionManager(ndk: NDK, options?: SessionManagerOptions)
```

**Parameters:**
- `ndk: NDK` - The NDK instance to use
- `options?: SessionManagerOptions` - Configuration options

**SessionManagerOptions:**

```typescript
interface SessionManagerOptions {
  storage?: SessionStorage;      // Storage backend (default: MemoryStorage)
  autoSave?: boolean;            // Auto-persist on changes (default: true)
  saveDebounceMs?: number;       // Debounce time for auto-save (default: 500ms)
}
```

**Example:**

```typescript
import { NDKSessionManager, LocalStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage(),
  autoSave: true,
  saveDebounceMs: 500
});
```

### Methods

#### login()

Login with a signer or user and optionally fetch session data.

```typescript
async login(
  userOrSigner: NDKUser | NDKSigner,
  options?: SessionLoginOptions
): Promise<Hexpubkey>
```

**Parameters:**
- `userOrSigner` - An NDKSigner for full sessions or NDKUser for read-only
- `options?: SessionLoginOptions` - Configuration for data fetching

**SessionLoginOptions:**

```typescript
interface SessionLoginOptions {
  // Fetch contact list (kind 3) and optional kind-scoped follows
  follows?: boolean | NDKKind[];

  // Fetch mute list (kind 10000)
  mutes?: boolean;

  // Fetch blocked relay list (kind 10001)
  blockedRelays?: boolean;

  // Fetch user's relay list (kind 10002)
  relayList?: boolean;

  // Fetch NIP-60 wallet (kind 17375)
  wallet?: boolean;

  // Fetch specific replaceable event kinds
  events?: Map<NDKKind, NDKEvent | null>;

  // Set muteFilter on NDK based on session's mute data (default: true)
  setMuteFilter?: boolean;

  // Set relayConnectionFilter on NDK based on blocked relays (default: true)
  setRelayConnectionFilter?: boolean;

  // Set this session as active immediately (default: false)
  setActive?: boolean;
}
```

**Returns:** `Promise<Hexpubkey>` - The public key of the logged-in user

**Example:**

```typescript
const signer = new NDKPrivateKeySigner(nsec);

const pubkey = await sessions.login(signer, {
  follows: true,
  mutes: true,
  relayList: true,
  wallet: true,
  events: new Map([[30078, null]]), // Fetch app data
  setActive: true
});

console.log('Logged in:', pubkey);
```

#### logout()

Remove a session. If no pubkey provided, removes the active session.

```typescript
logout(pubkey?: Hexpubkey): void
```

**Parameters:**
- `pubkey?: Hexpubkey` - Public key of session to remove (optional)

**Example:**

```typescript
// Logout specific user
sessions.logout(somePubkey);

// Logout active user
sessions.logout();
```

#### switchTo()

Switch the active session to a different user.

```typescript
switchTo(pubkey: Hexpubkey): void
```

**Parameters:**
- `pubkey: Hexpubkey` - Public key of session to activate

**Example:**

```typescript
sessions.switchTo(pubkey);
console.log('Now active:', sessions.activePubkey);
```

#### restore()

Restore sessions from storage.

```typescript
async restore(): Promise<void>
```

**Example:**

```typescript
await sessions.restore();

if (sessions.activeUser) {
  console.log('Restored session for', sessions.activeUser.npub);
}
```

#### persist()

Manually persist sessions to storage.

```typescript
async persist(): Promise<void>
```

**Example:**

```typescript
await sessions.persist();
```

#### clear()

Clear all sessions from storage.

```typescript
async clear(): Promise<void>
```

**Example:**

```typescript
await sessions.clear();
```

#### subscribe()

Subscribe to session state changes.

```typescript
subscribe(callback: (state: SessionState) => void): UnsubscribeFn
```

**Parameters:**
- `callback` - Function called when state changes

**Returns:** `UnsubscribeFn` - Function to unsubscribe

**SessionState:**

```typescript
interface SessionState {
  sessions: Map<Hexpubkey, NDKSession>;
  activePubkey?: Hexpubkey;
}
```

**Example:**

```typescript
const unsubscribe = sessions.subscribe((state) => {
  console.log('Active:', state.activePubkey);
  console.log('Sessions:', state.sessions.size);
});

// Later...
unsubscribe();
```

#### destroy()

Cleanup and stop all subscriptions and timers.

```typescript
destroy(): void
```

**Example:**

```typescript
sessions.destroy();
```

#### getSessions()

Get all sessions.

```typescript
getSessions(): Map<Hexpubkey, NDKSession>
```

**Example:**

```typescript
const allSessions = sessions.getSessions();
for (const [pubkey, session] of allSessions) {
  console.log(pubkey, session.user.profile?.name);
}
```

#### getSession()

Get a specific session by pubkey.

```typescript
getSession(pubkey: Hexpubkey): NDKSession | undefined
```

**Parameters:**
- `pubkey: Hexpubkey` - Public key of session to get

**Example:**

```typescript
const session = sessions.getSession(pubkey);
if (session) {
  console.log('Follows:', session.followSet?.size);
}
```

### Properties

#### activeSession

Get the currently active session.

```typescript
get activeSession(): NDKSession | undefined
```

**Example:**

```typescript
const session = sessions.activeSession;
if (session) {
  console.log('Follows:', session.followSet?.size);
  console.log('Mutes:', session.muteSet?.size);
}
```

#### activeUser

Get the currently active user.

```typescript
get activeUser(): NDKUser | undefined
```

**Example:**

```typescript
const user = sessions.activeUser;
if (user) {
  console.log('Active user:', user.npub);
  console.log('Profile:', user.profile?.name);
}
```

#### activePubkey

Get the currently active pubkey.

```typescript
get activePubkey(): Hexpubkey | undefined
```

**Example:**

```typescript
console.log('Active pubkey:', sessions.activePubkey);
```

## NDKSession

Represents an individual user session.

### Properties

```typescript
interface NDKSession {
  // User instance
  user: NDKUser;

  // Signer for this session (undefined for read-only sessions)
  signer?: NDKSigner;

  // Set of followed pubkeys
  followSet?: Set<Hexpubkey>;

  // Set of muted items (users, events, words, hashtags)
  muteSet?: Set<MuteItem>;

  // User's relay list
  relayList?: NDKRelayList;

  // Blocked relay URLs
  blockedRelayUrls?: Set<string>;

  // NIP-60 wallet event
  wallet?: NDKEvent;

  // Additional fetched events by kind
  events: Map<NDKKind, NDKEvent>;
}
```

## Storage Implementations

### LocalStorage

Browser localStorage implementation.

```typescript
new LocalStorage(key?: string)
```

**Parameters:**
- `key?: string` - Storage key (default: `'ndk-sessions'`)

**Example:**

```typescript
import { LocalStorage } from '@nostr-dev-kit/sessions';

const storage = new LocalStorage('my-app-sessions');
```

### FileStorage

Node.js filesystem implementation.

```typescript
new FileStorage(filePath?: string)
```

**Parameters:**
- `filePath?: string` - File path (default: `'./.ndk-sessions.json'`)

**Example:**

```typescript
import { FileStorage } from '@nostr-dev-kit/sessions';

const storage = new FileStorage('~/.config/myapp/sessions.json');
```

### MemoryStorage

In-memory implementation (no persistence).

```typescript
new MemoryStorage()
```

**Example:**

```typescript
import { MemoryStorage } from '@nostr-dev-kit/sessions';

const storage = new MemoryStorage();
```

## Custom Storage

Implement the `SessionStorage` interface for custom storage:

```typescript
interface SessionStorage {
  save(
    sessions: Map<Hexpubkey, SerializedSession>,
    activePubkey?: Hexpubkey
  ): Promise<void>;

  load(): Promise<{
    sessions: Map<Hexpubkey, SerializedSession>;
    activePubkey?: Hexpubkey;
  }>;

  clear(): Promise<void>;
}
```

**Example:**

```typescript
class MyCustomStorage implements SessionStorage {
  async save(sessions, activePubkey) {
    // Save to your backend...
  }

  async load() {
    // Load from your backend...
    return { sessions: new Map(), activePubkey: undefined };
  }

  async clear() {
    // Clear from your backend...
  }
}

const storage = new MyCustomStorage();
const sessions = new NDKSessionManager(ndk, { storage });
```

## Types

### Hexpubkey

```typescript
type Hexpubkey = string;
```

Hex-encoded public key string.

### MuteItem

```typescript
type MuteItem = {
  type: 'user' | 'event' | 'word' | 'hashtag';
  value: string;
  // ... other properties
};
```

Represents a muted item.

### SerializedSession

```typescript
interface SerializedSession {
  pubkey: Hexpubkey;
  signer?: string;           // Serialized signer
  followSet?: Hexpubkey[];
  muteSet?: MuteItem[];
  relayList?: RelayListData;
  blockedRelayUrls?: string[];
  wallet?: NostrEvent;
  events?: [NDKKind, NostrEvent][];
}
```

Serialized session format for storage.

### UnsubscribeFn

```typescript
type UnsubscribeFn = () => void;
```

Function to call to unsubscribe from updates.

## Error Handling

The sessions package may throw errors during:

- Login (invalid signer, network errors)
- Storage operations (permissions, disk full)
- Restoration (corrupted data)

Always wrap async operations in try-catch:

```typescript
try {
  await sessions.login(signer);
} catch (error) {
  console.error('Login failed:', error);
}

try {
  await sessions.restore();
} catch (error) {
  console.error('Failed to restore sessions:', error);
}
```

## Best Practices

### 1. Always Call destroy()

```typescript
// In your cleanup code
sessions.destroy();
```

### 2. Use autoSave

```typescript
const sessions = new NDKSessionManager(ndk, {
  autoSave: true,
  saveDebounceMs: 500
});
```

### 3. Handle No Active Session

```typescript
if (!sessions.activeUser) {
  // Show login UI
}
```

### 4. Subscribe to Changes

```typescript
const unsubscribe = sessions.subscribe((state) => {
  // Update UI when sessions change
});
```

### 5. Security

```typescript
// ⚠️ NEVER commit .ndk-sessions.json to git!
// Add to .gitignore:
// .ndk-sessions.json

// Use environment variables for sensitive keys
const nsec = process.env.NOSTR_NSEC;
```
