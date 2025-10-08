# Sessions

`@nostr-dev-kit/sessions` is a framework-agnostic session management library for NDK that provides multi-account support, automatic data fetching, and flexible persistence.

## Why Sessions?

Managing user authentication and session state in Nostr applications can be complex. The sessions package simplifies:

- **Multi-account management** - Let users switch between multiple Nostr identities seamlessly
- **Automatic data fetching** - Automatically fetch and cache follows, mutes, relay lists, and more
- **Persistence** - Save and restore sessions across app restarts
- **Framework agnostic** - Works with React, Svelte, Vue, vanilla JS, Node.js, etc.

## Key Features

### 🔐 Multiple Account Support

Users can log in with multiple Nostr accounts and switch between them instantly. Perfect for:
- Personal and business accounts
- Testing with multiple identities
- Content creators managing multiple personas

### 💾 Flexible Storage

Built-in storage adapters for:
- **LocalStorage** - Browser-based persistence
- **FileStorage** - Node.js/CLI applications
- **MemoryStorage** - Testing or temporary sessions
- **Custom** - Implement your own storage backend

### 🔄 Auto-Fetch User Data

On login, automatically fetch:
- Contact list (kind 3 follows)
- Mute lists (kind 10000)
- Relay lists (kind 10002)
- Blocked relay lists (kind 10001)
- NIP-60 wallet data (kind 17375)
- Any custom replaceable event kinds

### 🎯 Framework Integration

Works seamlessly with:
- React (via `@nostr-dev-kit/react`)
- Svelte 5 (via `@nostr-dev-kit/ndk-svelte5`)
- Mobile (React Native via `@nostr-dev-kit/mobile`)
- Vanilla JavaScript
- Node.js/CLI applications

## Installation

```bash
npm install @nostr-dev-kit/sessions
# or
bun add @nostr-dev-kit/sessions
```

## Quick Example

```typescript
import NDK from '@nostr-dev-kit/ndk';
import { NDKSessionManager, LocalStorage } from '@nostr-dev-kit/sessions';
import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

const ndk = new NDK({ explicitRelayUrls: ['wss://relay.damus.io'] });
await ndk.connect();

const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage(),
  autoSave: true
});

// Restore previous sessions
await sessions.restore();

// Login with auto-fetch
const signer = new NDKPrivateKeySigner(nsec);
await sessions.login(signer, {
  follows: true,
  mutes: true,
  relayList: true,
  setActive: true
});

console.log('Active user:', sessions.activeUser);
console.log('Follows:', sessions.activeSession?.followSet?.size);
```

## Next Steps

- [Quick Start Guide](./quick-start) - Get up and running
- [API Reference](./api) - Complete API documentation
- [Migration Guide](./migration) - Migrating from ndk-hooks

## Use Cases

### Browser Applications
Perfect for web apps that need:
- User login/logout
- Multi-account switching
- Persistent sessions across page reloads
- Automatic relay and follow list management

### Node.js/CLI Tools
Ideal for command-line tools that need:
- Saved credentials
- Multiple identity management
- Automated publishing with saved accounts

### Mobile Applications
Great for React Native apps needing:
- Secure session storage
- Multi-account support
- Offline-first data caching

## Architecture

The sessions package is built on three core components:

1. **NDKSessionManager** - Main API for managing sessions
2. **SessionStorage** - Pluggable storage backends
3. **NDKSession** - Individual session state and data

All session state changes are observable via the subscribe pattern, making it easy to integrate with any reactive framework.

## Security Considerations

⚠️ **Important:** Session serialization stores private keys. In production:

1. Use encrypted storage when possible
2. Never commit session files to version control
3. Use environment variables for sensitive keys
4. Consider NIP-07 (browser extensions) or NIP-46 (remote signers) for better security

## Framework-Specific Documentation

For framework-specific implementations using sessions:

- **React** - See [`@nostr-dev-kit/react` hooks documentation](/hooks/session-management)
- **Svelte 5** - See [`@nostr-dev-kit/ndk-svelte5` documentation](/wrappers/svelte)
- **Mobile** - See [`@nostr-dev-kit/mobile` documentation](/mobile/session)
