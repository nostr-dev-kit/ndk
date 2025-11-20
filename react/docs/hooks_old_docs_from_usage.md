## Usage with React Hooks (`ndk-hooks`)

When using the `ndk-hooks` package in a React application, the initialization process involves creating the NDK instance
and then using the `useNDKInit` hook to make it available to the rest of your application via Zustand stores.

This hook ensures that both the core NDK store and dependent stores (like the user profiles store) are properly
initialized with the NDK instance.

It's recommended to create and connect your NDK instance outside of your React components, potentially in a dedicated
setup file or at the root of your application. Then, use the `useNDKInit` hook within your main App component or a
context provider to initialize the stores once the component mounts.

```tsx
import React, {useEffect} from 'react'; // Removed useState
import NDK from '@nostr-dev-kit/ndk';
import {useNDKInit} from '@nostr-dev-kit/ndk-hooks'; // Assuming package name

// 1. Configure your NDK instance (e.g., in src/ndk.ts or similar)
const ndk = new NDK({
    explicitRelayUrls: ['wss://relay.damus.io', 'wss://relay.primal.net'],
    // Add signer or cache adapter if needed
});

// 2. Connect the instance immediately
ndk.connect()
    .then(() => console.log('NDK connected'))
    .catch((e) => console.error('NDK connection error:', e));

// Example: App component or Context Provider that initializes NDK stores
function App() {
    const initializeNDK = useNDKInit(); // Hook returns the function directly

    useEffect(() => {
        // 3. Initialize stores once the component mounts
        initializeNDK(ndk);
    }, [initializeNDK]); // Dependency ensures this runs if initializeNDK changes, though unlikely

    // Your application components can now use other ndk-hooks
    // No need to wait for connection state here, as hooks handle NDK readiness internally
    return (
        <div>
            {/* ... Your app content using useProfile, useSubscribe, etc. ... */}
        </div>
    );
}

export default App;
```

**Key Points:**

* Create and configure your `NDK` instance globally or outside components.
* Call `ndk.connect()` immediately after creation. Connection happens in the background.
* In your main App or Provider component, get the `initializeNDK` function from `useNDKInit`.
* Use `useEffect` with an empty dependency array (or `[initializeNDK]`) to call `initializeNDK(ndk)` once on mount.
* This sets up the necessary Zustand stores. Other `ndk-hooks` will access the initialized `ndk` instance from the store
  and handle its readiness internally.