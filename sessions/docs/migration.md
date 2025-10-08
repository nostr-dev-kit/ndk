# Migration Guide

This guide helps you migrate from the legacy session management in `@nostr-dev-kit/react` (ndk-hooks) to the new standalone `@nostr-dev-kit/sessions` package.

## Why Migrate?

The new `@nostr-dev-kit/sessions` package provides:

- **Framework agnostic** - Works with React, Svelte, Vue, vanilla JS, Node.js
- **Better separation of concerns** - Session logic is independent of UI framework
- **Improved testing** - Easier to test without framework dependencies
- **More flexible** - Better storage options and customization
- **Actively maintained** - The old hooks-based session management is deprecated

## Overview of Changes

### Old (ndk-hooks)

```typescript
// Hooks-based, React-specific
import { useNDKSessionLogin, useNDKCurrentUser } from '@nostr-dev-kit/react';

function MyComponent() {
  const login = useNDKSessionLogin();
  const currentUser = useNDKCurrentUser();

  // Login tied to React component lifecycle
  await login(signer);
}
```

### New (sessions package)

```typescript
// Framework-agnostic, standalone
import { NDKSessionManager, LocalStorage } from '@nostr-dev-kit/sessions';

const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage()
});

// Session management independent of UI framework
await sessions.login(signer);
```

## Migration Steps

### 1. Install New Package

```bash
npm install @nostr-dev-kit/sessions
```

### 2. Update React Integration

#### Before (ndk-hooks)

```typescript
// In your app setup
import { useNDKInit, useNDKSessionMonitor } from '@nostr-dev-kit/react';

function NDKHeadless() {
  const initNDK = useNDKInit();

  useNDKSessionMonitor(sessionStorage, {
    profile: true,
    follows: true
  });

  useEffect(() => {
    initNDK(ndk);
  }, []);

  return null;
}
```

#### After (sessions package)

```typescript
// In your app setup - sessions are now managed outside React
import NDK from '@nostr-dev-kit/ndk';
import { NDKSessionManager, LocalStorage } from '@nostr-dev-kit/sessions';

// Create session manager once, outside component tree
const ndk = new NDK({ explicitRelayUrls: [...] });
const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage()
});

// Initialize in app setup
await ndk.connect();
await sessions.restore();

// Then use React hooks from @nostr-dev-kit/react for UI integration
function MyApp() {
  // React hooks still available for reactive updates
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();

  return <YourApp />;
}
```

### 3. Update Login/Logout Logic

#### Before

```typescript
import { useNDKSessionLogin, useNDKSessionLogout } from '@nostr-dev-kit/react';

function LoginComponent() {
  const login = useNDKSessionLogin();
  const logout = useNDKSessionLogout();

  const handleLogin = async () => {
    await login(signer, { follows: true });
  };

  const handleLogout = async () => {
    await logout();
  };
}
```

#### After

```typescript
import { sessions } from './ndk-setup'; // Your session manager instance

function LoginComponent() {
  const handleLogin = async () => {
    await sessions.login(signer, {
      follows: true,
      mutes: true,
      setActive: true
    });
  };

  const handleLogout = () => {
    sessions.logout();
  };
}
```

### 4. Update Multi-Account Switching

#### Before

```typescript
import { useNDKSessionSwitch } from '@nostr-dev-kit/react';

function AccountSwitcher() {
  const switchSession = useNDKSessionSwitch();

  const handleSwitch = async (pubkey: string) => {
    await switchSession(pubkey);
  };
}
```

#### After

```typescript
import { sessions } from './ndk-setup';

function AccountSwitcher() {
  const handleSwitch = (pubkey: string) => {
    sessions.switchTo(pubkey);
  };
}
```

### 5. Update Session State Access

#### Before

```typescript
import { useNDKSessions, useNDKCurrentUser } from '@nostr-dev-kit/react';

function UserInfo() {
  const allSessions = useNDKSessions();
  const currentUser = useNDKCurrentUser();
}
```

#### After

```typescript
import { sessions } from './ndk-setup';
import { useNDKCurrentUser } from '@nostr-dev-kit/react';

function UserInfo() {
  const allSessions = sessions.getSessions();
  const currentUser = useNDKCurrentUser(); // Still available from React hooks
}
```

## Storage Migration

### Before (ndk-hooks)

```typescript
import { NDKSessionLocalStorage } from '@nostr-dev-kit/react';

const storage = new NDKSessionLocalStorage();
```

### After (sessions package)

```typescript
import { LocalStorage } from '@nostr-dev-kit/sessions';

const storage = new LocalStorage();
```

The storage interface is the same, just imported from the new package.

## Complete Example

### Before (ndk-hooks)

```typescript
// components/ndk.tsx
import { useNDKInit, useNDKSessionMonitor, NDKSessionLocalStorage } from '@nostr-dev-kit/react';

const sessionStorage = new NDKSessionLocalStorage();

export default function NDKHeadless() {
  const initNDK = useNDKInit();

  useNDKSessionMonitor(sessionStorage, {
    profile: true,
    follows: true
  });

  useEffect(() => {
    if (ndk) initNDK(ndk);
  }, []);

  return null;
}

// In components
function LoginButton() {
  const login = useNDKSessionLogin();
  const currentUser = useNDKCurrentUser();

  const handleLogin = async () => {
    const signer = new NDKPrivateKeySigner(nsec);
    await login(signer, { follows: true });
  };

  return currentUser ? (
    <div>Logged in as {currentUser.npub}</div>
  ) : (
    <button onClick={handleLogin}>Login</button>
  );
}
```

### After (sessions package)

```typescript
// ndk-setup.ts
import NDK from '@nostr-dev-kit/ndk';
import { NDKSessionManager, LocalStorage } from '@nostr-dev-kit/sessions';

export const ndk = new NDK({ explicitRelayUrls: [...] });

export const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage(),
  autoSave: true
});

// Initialize once
export async function initializeNDK() {
  await ndk.connect();
  await sessions.restore();

  // Subscribe to session changes to update NDK state
  sessions.subscribe((state) => {
    if (state.activePubkey) {
      const session = state.sessions.get(state.activePubkey);
      if (session?.signer) {
        ndk.signer = session.signer;
      }
    }
  });
}

// App.tsx
import { initializeNDK, ndk } from './ndk-setup';
import { useNDKInit } from '@nostr-dev-kit/react';

function App() {
  const initNDK = useNDKInit();

  useEffect(() => {
    initializeNDK().then(() => {
      initNDK(ndk); // Connect React hooks to NDK instance
    });
  }, []);

  return <YourApp />;
}

// In components
import { sessions } from './ndk-setup';
import { useNDKCurrentUser } from '@nostr-dev-kit/react';

function LoginButton() {
  const currentUser = useNDKCurrentUser();

  const handleLogin = async () => {
    const signer = new NDKPrivateKeySigner(nsec);
    await sessions.login(signer, {
      follows: true,
      mutes: true,
      setActive: true
    });
  };

  return currentUser ? (
    <div>Logged in as {currentUser.npub}</div>
  ) : (
    <button onClick={handleLogin}>Login</button>
  );
}
```

## Breaking Changes

### 1. Storage Location Changed

The default storage key has changed from `'ndk-session'` to `'ndk-sessions'` (plural). To migrate existing sessions:

```typescript
// Option 1: Specify old key
const storage = new LocalStorage('ndk-session');

// Option 2: Migrate data manually
const oldData = localStorage.getItem('ndk-session');
if (oldData) {
  localStorage.setItem('ndk-sessions', oldData);
  localStorage.removeItem('ndk-session');
}
```

### 2. Async Login

Login is now always async and returns the pubkey:

```typescript
// Before
login(signer); // Fire and forget

// After
const pubkey = await sessions.login(signer);
```

### 3. No Auto-Monitoring Hook

The `useNDKSessionMonitor` hook is replaced by creating a session manager:

```typescript
// Before
useNDKSessionMonitor(storage, options);

// After
const sessions = new NDKSessionManager(ndk, {
  storage,
  autoSave: true
});
await sessions.restore();
```

### 4. Direct Access Instead of Hooks

Many operations now use direct method calls instead of hooks:

```typescript
// Before: Hook-based
const logout = useNDKSessionLogout();
logout();

// After: Direct call
sessions.logout();
```

## Svelte Migration

If you're using Svelte, migration is similar:

### Before (ndk-svelte with hooks)

```typescript
// Mixed approach, not clean
import { ndk } from '$lib/stores/ndk';
```

### After (sessions with ndk-svelte5)

```typescript
// ndk.svelte.ts
import NDK from '@nostr-dev-kit/ndk';
import { NDKSessionManager, LocalStorage } from '@nostr-dev-kit/sessions';

export const ndk = new NDK({ explicitRelayUrls: [...] });

export const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage()
});

// Initialize
await ndk.connect();
await sessions.restore();
```

## Troubleshooting

### Sessions Not Persisting

Make sure `autoSave` is enabled:

```typescript
const sessions = new NDKSessionManager(ndk, {
  storage: new LocalStorage(),
  autoSave: true // ✓ Enable auto-save
});
```

### Signer Not Set on NDK

Subscribe to session changes and update NDK:

```typescript
sessions.subscribe((state) => {
  if (state.activePubkey) {
    const session = state.sessions.get(state.activePubkey);
    if (session?.signer) {
      ndk.signer = session.signer;
      ndk.activeUser = session.user;
    }
  }
});
```

### React Not Re-rendering

Make sure you've initialized NDK with the React store:

```typescript
import { useNDKInit } from '@nostr-dev-kit/react';

const initNDK = useNDKInit();
useEffect(() => {
  initNDK(ndk);
}, []);
```

## Need Help?

- [Quick Start Guide](./quick-start) - Fresh start with sessions
- [API Reference](./api) - Complete API documentation
- [GitHub Issues](https://github.com/nostr-dev-kit/ndk/issues) - Report migration issues
