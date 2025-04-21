# Session Monitoring in React

This snippet demonstrates how to set up session monitoring in a React application using ndk-hooks. Session monitoring allows your application to automatically persist and restore user sessions across page reloads or app restarts.

## Example: Setting Up Session Monitoring

```tsx
import React, { useEffect } from 'react';
import NDK from '@nostr-dev-kit/ndk';
import { 
  useNDKInit, 
  useNDKSessionMonitor, 
  NDKSessionLocalStorage,
  useNDKSessionLogin,
  useNDKCurrentUser
} from '@nostr-dev-kit/ndk-hooks';

// Initialize NDK
const ndkInstance = new NDK({
  explicitRelayUrls: [
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
    'wss://nos.lol',
  ],
});

// Connect to relays
ndkInstance.connect();

function App() {
  const initializeNDK = useNDKInit();
  const currentUser = useNDKCurrentUser();
  const login = useNDKSessionLogin();
  
  // Initialize NDK on component mount
  useEffect(() => {
    initializeNDK(ndkInstance);
  }, [initializeNDK]);
  
  // Create a storage adapter for localStorage
  const sessionStorage = new NDKSessionLocalStorage();
  
  // Set up session monitoring with the storage adapter
  useNDKSessionMonitor(sessionStorage, {
    // Optional configuration options
    follows: true, // Automatically fetch and monitor the user's contact list
  });
  
  return (
    <div>
      <h1>NDK Session Example</h1>
      {currentUser ? (
        <div>
          <p>Logged in as: {currentUser.pubkey.slice(0, 8)}...</p>
          {/* Your app content for logged-in users */}
        </div>
      ) : (
        <div>
          <p>Not logged in</p>
          {/* Your login UI */}
        </div>
      )}
    </div>
  );
}

export default App;
```

**Usage tips:**

- The `NDKSessionLocalStorage` class provides a default implementation that uses the browser's localStorage.
- The `useNDKSessionMonitor` hook takes a storage adapter and optional configuration.
- Sessions are automatically restored when your app loads, so users don't need to log in again.
- New sessions are automatically persisted when users log in.
- Sessions are removed from storage when users log out.
- You can use this alongside other session hooks like `useNDKSessionLogin`, `useNDKSessionLogout`, and `useNDKSessionSwitch`.