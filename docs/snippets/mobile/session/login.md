# Login with NDK Mobile

This snippet demonstrates how to implement user authentication in a React Native app using NDK Mobile. It supports multiple login methods including NIP-46 ("bunker://") and private keys (nsec).

```typescript
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-mobile';

function LoginScreen() {
    const { ndk, login } = useNDK();
    const currentUser = useNDKCurrentUser();

    async function handleLogin(payload: string) {
        if (!ndk) return;
        try {
            // Payload can be:
            // - NIP-46 bunker:// URL
            // - nsec private key
            await login(payload);
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    // Redirect when user is logged in
    useEffect(() => {
        if (currentUser) {
            // User is authenticated
            // Navigate to main app screen
        }
    }, [currentUser]);

    return (
        // Your login UI components
    );
}
```

## Key Features

- Uses `useNDK` hook to access NDK instance and login function
- Supports multiple authentication methods via single login function
- Tracks authentication state with `useNDKCurrentUser` hook
- Handles login errors gracefully

## Supported Login Methods

- NIP-46 Nostr Connect (bunker:// URLs)
- Private Keys (nsec format)
