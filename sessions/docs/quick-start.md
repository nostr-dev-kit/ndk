# Quick Start

Get started with NDK Sessions in minutes.

## Installation

```bash
npm install @nostr-dev-kit/sessions @nostr-dev-kit/ndk
# or
bun add @nostr-dev-kit/sessions @nostr-dev-kit/ndk
```

## Basic Setup

### 1. Initialize NDK

First, create and connect your NDK instance:

```typescript
import NDK from '@nostr-dev-kit/ndk';

const ndk = new NDK({
  explicitRelayUrls: [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.nostr.band'
  ]
});

await ndk.connect();
```

### 2. Create Session Manager

Create a session manager with your preferred storage:

```typescript
import { NDKSessionManager, LocalStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage(),
  autoSave: true,           // Automatically save changes
  saveDebounceMs: 500       // Debounce auto-saves
});
```

### 3. Restore Previous Sessions

Restore any previously saved sessions:

```typescript
await sessions.restore();

if (sessions.activeUser) {
  console.log('Welcome back!', sessions.activeUser.npub);
}
```

### 4. Login

Login with a signer. To automatically fetch user data, configure `fetches` in the constructor:

```typescript
import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage(),
  autoSave: true,
  fetches: {
    follows: true,      // Fetch contact list
    mutes: true,        // Fetch mute list
    relayList: true,    // Fetch relay list
    wallet: true        // Fetch NIP-60 wallet
  }
});

const signer = new NDKPrivateKeySigner(nsecKey);
await sessions.login(signer);

// Access session data
console.log('Following:', sessions.activeSession?.followSet?.size, 'users');
console.log('Muted:', sessions.activeSession?.muteSet?.size, 'items');
```

## Storage Options

### Browser (LocalStorage)

```typescript
import { LocalStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage('my-app-sessions') // Custom key
});
```

### Node.js (FileStorage)

```typescript
import { FileStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new FileStorage('./.ndk-sessions.json')
});
```

### Temporary (MemoryStorage)

```typescript
import { MemoryStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new MemoryStorage(), // No persistence
  autoSave: false
});
```

## Multi-Account Management

### Login Multiple Accounts

```typescript
// Login first account (automatically active)
const signer1 = new NDKPrivateKeySigner(nsec1);
const pubkey1 = await sessions.login(signer1);

// Login second account
const signer2 = new NDKPrivateKeySigner(nsec2);
const pubkey2 = await sessions.login(signer2, { setActive: false });

console.log('Accounts:', sessions.getSessions().size);
```

### Switch Between Accounts

```typescript
// Switch to different account
sessions.switchTo(pubkey2);
console.log('Active:', sessions.activePubkey);

// Switch back
sessions.switchTo(pubkey1);
```

### Logout

```typescript
// Logout specific account
sessions.logout(pubkey1);

// Or logout current active account
sessions.logout();
```

## React to Changes

Subscribe to session changes:

```typescript
const unsubscribe = sessions.subscribe((state) => {
  console.log('Active user:', state.activePubkey);
  console.log('Total sessions:', state.sessions.size);

  // Update your UI...
});

// Later, cleanup
unsubscribe();
```

## Read-Only Sessions

Create a read-only session without a signer. Configure `fetches` in the constructor:

```typescript
const sessions = new NDKSessionManager(ndk, {
  fetches: {
    follows: true,
    relayList: true
  }
});

const user = ndk.getUser({ pubkey: somePubkey });
await sessions.login(user);

// Data is fetched and cached, but user can't sign events
```

## Using with NIP-07 (Browser Extensions)

```typescript
import { NDKNip07Signer } from '@nostr-dev-kit/ndk';

const sessions = new NDKSessionManager(ndk, {
  fetches: {
    follows: true,
    mutes: true
  }
});

const signer = new NDKNip07Signer();
await sessions.login(signer);
```

## CLI Example

Complete example for a Node.js CLI tool:

```typescript
#!/usr/bin/env node
import NDK from '@nostr-dev-kit/ndk';
import { NDKSessionManager, FileStorage } from '@nostr-dev-kit/sessions';
import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

const ndk = new NDK({ explicitRelayUrls: ['wss://relay.damus.io'] });
await ndk.connect();

const sessions = new NDKSessionManager(ndk, {
  storage: new FileStorage('./.ndk-sessions.json'),
  autoSave: true,
  fetches: {
    follows: true
  }
});

// Restore previous session
await sessions.restore();

if (!sessions.activeUser) {
  // First time - login
  const nsec = process.env.NOSTR_NSEC;
  if (!nsec) throw new Error('NOSTR_NSEC not set');

  const signer = new NDKPrivateKeySigner(nsec);
  await sessions.login(signer);

  console.log('Logged in as', sessions.activeUser.npub);
} else {
  console.log('Welcome back', sessions.activeUser.npub);
}

// Use the active session to publish
const event = new NDKEvent(ndk, {
  kind: 1,
  content: 'Hello from CLI!'
});

await event.publish();
console.log('Published:', event.id);

// Cleanup
sessions.destroy();
```

## Next Steps

- [API Reference](./api) - Complete API documentation
- [Migration Guide](./migration) - Migrating from ndk-hooks
- [React Hooks](/hooks/session-management) - Using with React
- [Svelte](/wrappers/svelte) - Using with Svelte
