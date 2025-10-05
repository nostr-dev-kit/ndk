# @nostr-dev-kit/sessions

Framework-agnostic session management for NDK with multi-account support and persistence.

## Features

- 🔐 **Multi-account support** - Manage multiple Nostr accounts simultaneously
- 💾 **Flexible persistence** - Built-in localStorage, filesystem, and memory storage
- 🔄 **Auto-sync** - Automatically fetch profiles, follows, and events
- 🎯 **Framework-agnostic** - Works with React, Svelte, Vue, vanilla JS, Node.js, etc.
- 🔌 **Minimal boilerplate** - Simple, intuitive API
- 🎨 **Full TypeScript** - Complete type safety

## Installation

```bash
npm install @nostr-dev-kit/sessions
# or
bun add @nostr-dev-kit/sessions
```

## Quick Start

```typescript
import NDK from '@nostr-dev-kit/ndk';
import { NDKSessionManager, MemoryStorage } from '@nostr-dev-kit/sessions';
import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

// Setup NDK
const ndk = new NDK({ explicitRelayUrls: ['wss://relay.damus.io'] });
await ndk.connect();

// Create session manager
const sessions = new NDKSessionManager(ndk);

// Login
const signer = new NDKPrivateKeySigner(myNsec);
await sessions.login(signer, {
  profile: true,    // Auto-fetch profile
  follows: true,    // Auto-fetch follows
  setActive: true   // Set as active session
});

console.log('Active user:', sessions.activeUser);
```

## Usage Examples

### Browser with localStorage

```typescript
import { NDKSessionManager, LocalStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage(),
  autoSave: true  // Automatically persist changes
});

// Restore sessions from localStorage
await sessions.restore();

// Login with browser extension (NIP-07)
import { NDKNip07Signer } from '@nostr-dev-kit/ndk';
const signer = new NDKNip07Signer();
await sessions.login(signer);
```

### Node.js/CLI with File Storage

```typescript
import { NDKSessionManager, FileStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new FileStorage('./.ndk-sessions.json'),
  autoSave: true
});

// Restore sessions from file
await sessions.restore();

// Login
const signer = new NDKPrivateKeySigner(process.env.NOSTR_NSEC);
await sessions.login(signer, {
  profile: true,
  follows: true
});

// Use active session
const event = new NDKEvent(ndk, { kind: 1, content: 'Hello from CLI!' });
await event.publish(); // Uses active session's signer
```

### Multi-Account Management

```typescript
// Login multiple accounts
const signer1 = new NDKPrivateKeySigner(nsec1);
const signer2 = new NDKPrivateKeySigner(nsec2);

const pubkey1 = await sessions.login(signer1);
const pubkey2 = await sessions.login(signer2);

// Get all sessions
console.log('Sessions:', sessions.getSessions());

// Switch between accounts
sessions.switchTo(pubkey1);
console.log('Active:', sessions.activePubkey);

sessions.switchTo(pubkey2);
console.log('Active:', sessions.activePubkey);

// Logout specific account
sessions.logout(pubkey1);

// Or logout active account
sessions.logout();
```

### Read-Only Sessions

```typescript
import { NDKUser } from '@nostr-dev-kit/ndk';

// Create read-only session without signer
const user = ndk.getUser({ pubkey: somePubkey });
await sessions.login(user, {
  profile: true,
  follows: true
});

// User data is fetched and cached, but can't sign events
```

### Subscribe to Changes

```typescript
const unsubscribe = sessions.subscribe((state) => {
  console.log('Active user:', state.activePubkey);
  console.log('Sessions count:', state.sessions.size);
});

// Later...
unsubscribe();
```

### Auto-Fetch Session Data

```typescript
await sessions.login(signer, {
  // Fetch user profile (kind 0)
  profile: true,

  // Fetch contact list (kind 3)
  follows: true,

  // Fetch additional event kinds
  events: new Map([
    [10002, null], // NIP-65 relay list
    [30078, null], // NIP-78 app data
  ])
});

// Access session data
const session = sessions.activeSession;
console.log('Profile:', session.profile);
console.log('Following:', session.followSet?.size, 'users');
console.log('Relay list:', session.events.get(10002));
```

### Manual Persistence

```typescript
import { MemoryStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new MemoryStorage(),
  autoSave: false  // Disable auto-save
});

// Manually persist
await sessions.persist();

// Manually restore
await sessions.restore();

// Clear storage
await sessions.clear();
```

## API Reference

### `NDKSessionManager`

#### Constructor

```typescript
new NDKSessionManager(ndk: NDK, options?: SessionManagerOptions)
```

**Options:**
- `storage?: SessionStorage` - Storage backend (LocalStorage, FileStorage, MemoryStorage, or custom)
- `autoSave?: boolean` - Auto-persist on changes (default: `true`)
- `saveDebounceMs?: number` - Debounce time for auto-save (default: `500`)

#### Methods

**`login(userOrSigner, options?): Promise<Hexpubkey>`**

Login with a signer or user.

```typescript
await sessions.login(signer, {
  profile: true,
  follows: true,
  events: new Map([[10002, null]]),
  setActive: true
});
```

**`logout(pubkey?): void`**

Logout (remove) a session. If no pubkey provided, logs out active session.

**`switchTo(pubkey): void`**

Switch to a different session.

**`restore(): Promise<void>`**

Restore sessions from storage.

**`persist(): Promise<void>`**

Persist sessions to storage.

**`clear(): Promise<void>`**

Clear all sessions from storage.

**`subscribe(callback): UnsubscribeFn`**

Subscribe to state changes.

**`destroy(): void`**

Cleanup and stop all subscriptions.

#### Properties

**`activeSession: NDKSession | undefined`**

Get the active session.

**`activeUser: NDKUser | undefined`**

Get the active user with profile data.

**`activePubkey: Hexpubkey | undefined`**

Get the active pubkey.

**`getSessions(): Map<Hexpubkey, NDKSession>`**

Get all sessions.

**`getSession(pubkey): NDKSession | undefined`**

Get a specific session.

### Storage Implementations

#### `LocalStorage`

Browser localStorage implementation.

```typescript
new LocalStorage(key?: string)
```

#### `FileStorage`

Node.js filesystem implementation.

```typescript
new FileStorage(filePath?: string)
```

#### `MemoryStorage`

In-memory implementation (no persistence).

```typescript
new MemoryStorage()
```

#### Custom Storage

Implement the `SessionStorage` interface:

```typescript
interface SessionStorage {
  save(sessions: Map<Hexpubkey, SerializedSession>, activePubkey?: Hexpubkey): Promise<void>;
  load(): Promise<{ sessions: Map<Hexpubkey, SerializedSession>; activePubkey?: Hexpubkey }>;
  clear(): Promise<void>;
}
```

## Framework Integration

### React (with ndk-hooks)

```typescript
// Coming soon: useNDKSessions hook in @nostr-dev-kit/ndk-hooks
```

### Svelte 5 (with ndk-svelte5)

```typescript
// Coming soon: sessions store in @nostr-dev-kit/ndk-svelte5
```

### Vanilla Store Access

```typescript
import { createSessionStore } from '@nostr-dev-kit/sessions';

const store = createSessionStore();
store.getState().init(ndk);

// Subscribe to changes
const unsubscribe = store.subscribe((state) => {
  console.log(state.activePubkey);
});
```

## Best Practices

### Security

⚠️ **WARNING:** Signer serialization stores private keys. In production:

1. Use encrypted storage
2. Never commit `.ndk-sessions.json` to version control
3. Use environment variables for sensitive keys
4. Consider NIP-07 (browser extension) or NIP-46 (remote signer) for better security

### Performance

- Use `autoSave: true` with appropriate `saveDebounceMs` to avoid excessive writes
- Call `destroy()` when cleaning up to prevent memory leaks
- Use `MemoryStorage` for testing or when persistence isn't needed

### Error Handling

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

## License

MIT
