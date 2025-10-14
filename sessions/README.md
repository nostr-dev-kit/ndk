# @nostr-dev-kit/sessions

Framework-agnostic session management for NDK with multi-account support and persistence.

## Features

- 🔐 **Multi-account support** - Manage multiple Nostr accounts simultaneously
- 💾 **Flexible persistence** - Built-in localStorage, filesystem, and memory storage
- 🔄 **Auto-sync** - Automatically fetch follows, mutes, relays, and events
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
  follows: true,    // Auto-fetch follows
  mutes: true,      // Auto-fetch mutes
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
  follows: true,
  mutes: true
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
  follows: true,
  relayList: true
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
  // Fetch contact list (kind 3)
  follows: true,

  // Fetch mute list (kind 10000)
  mutes: true,

  // Fetch blocked relay list (kind 10001)
  blockedRelays: true,

  // Fetch user's relay list (kind 10002)
  relayList: true,

  // Fetch NIP-60 wallet (kind 17375)
  wallet: true,

  // Fetch additional event kinds
  events: new Map([
    [30078, undefined], // NIP-78 app data
  ]),

  // Automatically set muteFilter on NDK (default: true)
  setMuteFilter: true,

  // Automatically set relayConnectionFilter on NDK (default: true)
  setRelayConnectionFilter: true
});

// Access session data
const session = sessions.activeSession;
console.log('Following:', session.followSet?.size, 'users');
console.log('Muted:', session.muteSet?.size, 'items');
console.log('Relay list:', session.relayList);
console.log('App data:', session.events.get(30078));
```

### Custom Event Classes

You can provide custom NDKEvent subclasses to automatically wrap events as they're received. This is useful for adding custom methods or properties to specific event kinds:

```typescript
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { NDKBlossomList } from '@nostr-dev-kit/ndk';

// Define a custom event class for kind 10015 (Interest Lists)
class NDKInterestList extends NDKEvent {
  static kinds = [10015 as NDKKind]; // Required for eventConstructors option

  static from(event: NDKEvent): NDKInterestList {
    return new NDKInterestList(event.ndk, event.rawEvent());
  }

  get interests(): string[] {
    return this.getMatchingTags('t').map(tag => tag[1]);
  }

  addInterest(interest: string): void {
    this.tags.push(['t', interest]);
  }
}

// Option 1: Using eventConstructors (recommended - more ergonomic)
await sessions.login(signer, {
  follows: true,
  eventConstructors: [NDKBlossomList, NDKInterestList]
});

// Option 2: Using events Map (explicit)
await sessions.login(signer, {
  follows: true,
  events: new Map([
    [10015, NDKInterestList], // Wrap kind 10015 with custom class
    [30078, undefined],        // Fetch kind 30078 as regular NDKEvent
  ])
});

// Access the wrapped event with custom methods
const session = sessions.activeSession;
const interestList = session.events.get(10015) as NDKInterestList;
console.log('User interests:', interestList.interests);

// Use custom methods
interestList.addInterest('nostr');
await interestList.publish();
```

**Key features:**
- **Automatic wrapping** - Events are wrapped using the class's `.from()` method
- **Type safety** - Cast to your custom class for full TypeScript support
- **Custom methods** - Add domain-specific methods and computed properties
- **Inheritance** - Custom classes extend NDKEvent, so all standard methods work
- **Ergonomic API** - Use `eventConstructors` array for cleaner syntax

**Requirements:**
- Custom class must extend `NDKEvent`
- Must implement a static `from(event: NDKEvent)` method
- Must have a static `kinds` array property (when using `eventConstructors`)
- The `from()` method should return an instance of your custom class

**eventConstructors vs events:**
- `eventConstructors` - More ergonomic, uses the class's static `kinds` property
- `events` - More explicit, requires manual kind-to-class mapping
- Both options can be used together and will be merged

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

### Runtime Wallet Control

Sessions supports runtime control of wallet fetching, allowing apps to enable/disable wallet features based on user preferences:

```typescript
// Start session without wallet
const sessions = new NDKSessionManager(ndk, {
  fetches: { follows: true }
});

await sessions.login(signer);

// Later, when user wants to use wallet features
if (!sessions.isWalletEnabled()) {
  // App shows UI prompt: "Enable wallet for zaps?"
  const userConsent = await askUser();

  if (userConsent) {
    // Enable wallet and remember preference
    sessions.enableWallet();
  }
}

// Check wallet state
console.log('Wallet enabled:', sessions.isWalletEnabled());

// Disable wallet
sessions.disableWallet();
```

**Key features:**
- **Runtime control** - Enable/disable wallet after session starts
- **Persistent preferences** - User's choice is saved and restored
- **Per-session** - Each account can have different wallet settings

**Usage patterns:**

```typescript
// 1. Wallet app (always enable)
const sessions = new NDKSessionManager(ndk, {
  fetches: { wallet: true }
});

// 2. Social app (ask user first time)
const sessions = new NDKSessionManager(ndk, {
  fetches: { wallet: false } // disabled by default
});
await sessions.restore(); // respects saved preferences

// When user tries to zap
if (!sessions.isWalletEnabled()) {
  if (await confirm("Enable wallet?")) {
    sessions.enableWallet(); // saves preference
  }
}

// 3. Multi-account with per-user preferences
sessions.enableWallet(userPubkey1);  // enable for user 1
sessions.disableWallet(userPubkey2); // disable for user 2
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

**Options:**
- `follows?: boolean | NDKKind[]` - Fetch contact list (kind 3) and optional kind-scoped follows
- `mutes?: boolean` - Fetch mute list (kind 10000)
- `blockedRelays?: boolean` - Fetch blocked relay list (kind 10001)
- `relayList?: boolean` - Fetch user's relay list (kind 10002)
- `wallet?: boolean` - Fetch NIP-60 wallet (kind 17375)
- `events?: Map<NDKKind, any>` - Fetch specific replaceable event kinds. Value can be:
  - A custom NDKEvent subclass with a static `from()` method to wrap events
  - `undefined` to fetch as regular NDKEvent
- `eventConstructors?: NDKEventConstructor[]` - Array of event class constructors to register. More ergonomic alternative to `events`. Each constructor must have:
  - A static `kinds` array property listing the kinds it handles
  - A static `from(event: NDKEvent)` method to wrap events
- `setMuteFilter?: boolean` - Set muteFilter on NDK based on session's mute data (default: `true`)
- `setRelayConnectionFilter?: boolean` - Set relayConnectionFilter on NDK based on session's blocked relays (default: `true`)
- `setActive?: boolean` - Set this session as active immediately

```typescript
// Using eventConstructors (recommended)
await sessions.login(signer, {
  follows: true,
  mutes: true,
  relayList: true,
  wallet: true,
  eventConstructors: [NDKBlossomList, CustomInterestList],
  setActive: true
});

// Using events Map (explicit)
await sessions.login(signer, {
  follows: true,
  mutes: true,
  relayList: true,
  wallet: true,
  events: new Map([
    [10015, CustomInterestList], // Wrap with custom class
    [30078, undefined]            // Regular NDKEvent
  ]),
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

**`enableWallet(pubkey?): void`**

Enable wallet fetching for a session. If no pubkey provided, uses active session. Updates preference and restarts subscription with wallet enabled.

**`disableWallet(pubkey?): void`**

Disable wallet fetching for a session. If no pubkey provided, uses active session. Updates preference and restarts subscription without wallet.

**`isWalletEnabled(pubkey?): boolean`**

Check if wallet fetching is enabled for a session. If no pubkey provided, uses active session. Returns saved preference or false if not set.

#### Properties

**`activeSession: NDKSession | undefined`**

Get the active session.

**`activeUser: NDKUser | undefined`**

Get the active user.

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
// Coming soon: useNDKSessions hook in @nostr-dev-kit/react
```

### Svelte 5 (with svelte)

```typescript
// Coming soon: sessions store in @nostr-dev-kit/svelte
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
