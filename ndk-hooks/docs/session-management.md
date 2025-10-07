# Session Management

NDK React Hooks provides robust session management capabilities, allowing you to easily implement user authentication, multiple account support, and persistent sessions in your React applications.

## Core Concepts

NDK sessions are managed through a series of specialized hooks that handle different aspects of the user authentication flow:

- **Login/Authentication**: Creating new sessions with signers
- **Session Persistence**: Saving and restoring sessions across page reloads
- **Session Switching**: Managing multiple accounts
- **Logout**: Removing sessions

## Setting Up Session Storage

Before using the session management hooks, you'll need to set up a storage mechanism to persist sessions. The library comes with a built-in `NDKSessionLocalStorage` implementation, but you can create custom storage adapters by implementing the `NDKSessionStorage` interface.

```tsx
import { NDKSessionLocalStorage } from '@nostr-dev-kit/ndk-hooks';

// Create the storage instance
const sessionStorage = new NDKSessionLocalStorage();
```

## Session Monitoring (Persistence)

The `useNDKSessionMonitor` hook automatically handles the persistence and restoration of sessions. It should be set up once at the root of your application:

```tsx
import { NDKSessionLocalStorage, useNDKSessionMonitor } from '@nostr-dev-kit/ndk-hooks';

// Inside your root component or NDK initialization component
function NDKSessionProvider() {
  // Set up session storage
  const sessionStorage = new NDKSessionLocalStorage();
  
  // Set up session monitoring with options
  useNDKSessionMonitor(sessionStorage, {
    profile: true,  // automatically fetch profile information for the active user
    follows: true,  // automatically fetch follows of the active user
  });
  
  return null; // or your component JSX
}
```

The session monitor will:

1. Automatically restore sessions from storage when your app loads
2. Persist new sessions when users log in
3. Update storage when sessions change
4. Remove sessions from storage when users log out

## Logging In

Use the `useNDKSessionLogin` hook to log users in. This hook returns a function that accepts an `NDKSigner` instance, which can be any of the supported signer types (e.g., `NDKPrivateKeySigner`, `NDKNip07Signer`).

### Basic Login Example

```tsx
import { useNDKSessionLogin } from '@nostr-dev-kit/ndk-hooks';
import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

function LoginComponent() {
  const login = useNDKSessionLogin();
  const [nsec, setNsec] = useState('');
  
  const handleLogin = async () => {
    try {
      // Create a signer from the private key
      const signer = new NDKPrivateKeySigner(nsec);
      
      // Login and create a session
      await login(signer);
      
      // Success! User is now logged in
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <div>
      <input
        type="password"
        value={nsec}
        onChange={(e) => setNsec(e.target.value)}
        placeholder="Enter your nsec..."
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

### NIP-07 Browser Extension Login

If the user has a NIP-07 compatible browser extension (like nos2x or Alby), you can use the `NDKNip07Signer`:

```tsx
import { useNDKSessionLogin } from '@nostr-dev-kit/ndk-hooks';
import { NDKNip07Signer } from '@nostr-dev-kit/ndk';

function Nip07LoginButton() {
  const login = useNDKSessionLogin();
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // Create a signer using the browser extension
      const signer = new NDKNip07Signer();
      
      // Login with the extension
      await login(signer);
      
      console.log('Extension login successful');
    } catch (error) {
      console.error('Extension login failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Connecting...' : 'Login with Extension'}
    </button>
  );
}
```

### Read-Only Login

You can also create read-only sessions by providing just an `NDKUser` object:

```tsx
import { useNDKSessionLogin } from '@nostr-dev-kit/ndk-hooks';
import { NDKUser } from '@nostr-dev-kit/ndk';

function ReadOnlyLogin() {
  const login = useNDKSessionLogin();
  const [pubkey, setPubkey] = useState('');
  
  const handleReadOnlyLogin = async () => {
    try {
      // Create an NDKUser from the pubkey
      const user = new NDKUser({ pubkey });
      
      // Create a read-only session
      await login(user);
      
      console.log('Read-only login successful');
    } catch (error) {
      console.error('Read-only login failed:', error);
    }
  };
  
  return (
    <div>
      <input
        value={pubkey}
        onChange={(e) => setPubkey(e.target.value)}
        placeholder="Enter pubkey for read-only..."
      />
      <button onClick={handleReadOnlyLogin}>Read-Only Login</button>
    </div>
  );
}
```

## Accessing the Current User

You can access the currently logged-in user using the `useNDKCurrentUser` hook:

```tsx
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';

function CurrentUserInfo() {
  const currentUser = useNDKCurrentUser();
  
  if (!currentUser) {
    return <div>No user is currently logged in</div>;
  }
  
  return (
    <div>
      <h2>Current User</h2>
      <p>Pubkey: {currentUser.pubkey}</p>
      {/* Display other user information */}
    </div>
  );
}
```

## Managing Multiple Accounts

NDK React Hooks supports multiple-account management, allowing users to switch between different Nostr accounts.

### Listing User Sessions

To display all available sessions, use the `useNDKSessions` hook:

```tsx
import { useNDKSessions } from '@nostr-dev-kit/ndk-hooks';

function AccountSwitcher() {
  const { sessions, currentSession } = useNDKSessions();
  
  return (
    <div>
      <h3>Your Accounts</h3>
      <ul>
        {sessions.map((session) => (
          <li key={session.user.pubkey}>
            {session.user.pubkey.slice(0, 8)}...
            {session === currentSession ? ' (active)' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Switching Between Sessions

Use the `useNDKSessionSwitch` hook to switch between available sessions:

```tsx
import { useNDKSessions, useNDKSessionSwitch } from '@nostr-dev-kit/ndk-hooks';

function AccountSwitcher() {
  const { sessions, currentSession } = useNDKSessions();
  const switchSession = useNDKSessionSwitch();
  
  return (
    <div>
      <h3>Your Accounts</h3>
      <ul>
        {sessions.map((session) => (
          <li key={session.user.pubkey}>
            <button 
              onClick={() => switchSession(session)}
              disabled={session === currentSession}
            >
              {session.user.pubkey.slice(0, 8)}...
              {session === currentSession ? ' (active)' : ''}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Logging Out

To log out the current user, use the `useNDKSessionLogout` hook:

```tsx
import { useNDKSessionLogout, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';

function LogoutButton() {
  const logout = useNDKSessionLogout();
  const currentUser = useNDKCurrentUser();
  
  if (!currentUser) {
    return null; // No user is logged in
  }
  
  const handleLogout = () => {
    logout();
    console.log('User logged out successfully');
  };
  
  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

### Logging Out Specific Sessions

You can also log out specific sessions by passing the session to the logout function:

```tsx
import { useNDKSessionLogout, useNDKSessions } from '@nostr-dev-kit/ndk-hooks';

function SessionManager() {
  const { sessions } = useNDKSessions();
  const logout = useNDKSessionLogout();
  
  return (
    <div>
      <h3>Manage Sessions</h3>
      <ul>
        {sessions.map((session) => (
          <li key={session.user.pubkey}>
            {session.user.pubkey.slice(0, 8)}...
            <button onClick={() => logout(session)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Complete Example

Here's a complete example showing how to set up session management in a React application:

```tsx
// src/components/NDKProvider.tsx
import React, { useEffect } from 'react';
import NDK, { NDKCacheAdapter } from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/cache-dexie';
import { 
  NDKSessionLocalStorage, 
  useNDKInit, 
  useNDKSessionMonitor 
} from '@nostr-dev-kit/ndk-hooks';

// Create cache adapter
const cacheAdapter = new NDKCacheAdapterDexie({ dbName: 'my-nostr-app' });

// Define relays
const explicitRelayUrls = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol'
];

// Create NDK instance
const ndk = new NDK({ 
  explicitRelayUrls,
  cacheAdapter,
  autoConnectUserRelays: true
});

// Connect to relays
ndk.connect();

// Session storage
const sessionStorage = new NDKSessionLocalStorage();

export default function NDKProvider() {
  // Initialize NDK in the hook system
  const initNDK = useNDKInit();
  
  // Setup session monitoring
  useNDKSessionMonitor(sessionStorage, {
    profile: true,
    follows: true
  });
  
  // Initialize NDK on mount
  useEffect(() => {
    initNDK(ndk);
  }, [initNDK]);
  
  return null;
}

// src/components/AuthManager.tsx
import React, { useState } from 'react';
import { 
  useNDKSessionLogin, 
  useNDKSessionLogout,
  useNDKSessionSwitch,
  useNDKSessions,
  useNDKCurrentUser
} from '@nostr-dev-kit/ndk-hooks';
import { NDKPrivateKeySigner, NDKNip07Signer } from '@nostr-dev-kit/ndk';

export default function AuthManager() {
  const [nsec, setNsec] = useState('');
  const login = useNDKSessionLogin();
  const logout = useNDKSessionLogout();
  const { sessions } = useNDKSessions();
  const switchSession = useNDKSessionSwitch();
  const currentUser = useNDKCurrentUser();
  
  const handlePrivateKeyLogin = async () => {
    try {
      const signer = new NDKPrivateKeySigner(nsec);
      await login(signer);
      setNsec(''); // Clear input after login
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const handleExtensionLogin = async () => {
    try {
      const signer = new NDKNip07Signer();
      await login(signer);
    } catch (error) {
      console.error('Extension login failed:', error);
    }
  };
  
  return (
    <div>
      <h2>Authentication</h2>
      
      {currentUser ? (
        <div>
          <p>Logged in as: {currentUser.pubkey.slice(0, 8)}...</p>
          <button onClick={() => logout()}>Logout</button>
        </div>
      ) : (
        <div>
          <h3>Login</h3>
          <div>
            <input
              type="password"
              value={nsec}
              onChange={(e) => setNsec(e.target.value)}
              placeholder="Enter your nsec..."
            />
            <button onClick={handlePrivateKeyLogin}>Login with Private Key</button>
          </div>
          <div>
            <button onClick={handleExtensionLogin}>Login with Extension</button>
          </div>
        </div>
      )}
      
      {sessions.length > 0 && (
        <div>
          <h3>Your Accounts</h3>
          <ul>
            {sessions.map((session) => (
              <li key={session.user.pubkey}>
                <button 
                  onClick={() => switchSession(session)}
                  disabled={session.user === currentUser}
                >
                  {session.user.pubkey.slice(0, 8)}...
                  {session.user === currentUser ? ' (active)' : ''}
                </button>
                <button onClick={() => logout(session)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// src/App.tsx
import React from 'react';
import NDKProvider from './components/NDKProvider';
import AuthManager from './components/AuthManager';

export default function App() {
  return (
    <div>
      <NDKProvider />
      <h1>My Nostr App</h1>
      <AuthManager />
      {/* Other app components */}
    </div>
  );
}
```

## Next Steps

After setting up session management, you can use other NDK React hooks to interact with Nostr data, such as `useSubscribe` for fetching events, `useProfileValue` for user profiles, and more.

