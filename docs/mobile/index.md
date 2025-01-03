# NDK Mobile

A React Native/Expo implementation of [NDK (Nostr Development Kit)](https://github.com/nostr-dev-kit/ndk) that provides a complete toolkit for building Nostr applications on mobile platforms.

## Features

- 🔐 Multiple signer implementations (NIP-07, NIP-46, Private Key)
- 💾 SQLite-based caching for offline support
- 🔄 Subscription management with automatic reconnection
- 📱 React Native and Expo compatibility
- 🪝 React hooks for easy state management
- 👛 Integrated wallet support

## Installation

```sh
npm install @nostr-dev-kit/ndk-mobile
```

## Usage

When using this library don't import `@nostr-dev-kit/ndk` directly, instead import `@nostr-dev-kit/ndk-mobile`. `ndk-mobile` exports the same classes as `ndk`, so you can just swap the import.

### Initialization

Initialize NDK using the init function, probably when your app loads.

```tsx
function App() {
    const { ndk, init: initializeNDK } = useNDK();

    useEffect(() => {
        initializeNDK({
            /* Any parameter you'd want to pass to NDK */
            explicitRelayUrls: [...],
            // ...
        }
    }, []);
}
```

### Settings

Throughout the use of a normal app, you will probably want to store some settings, such us, the user that is logged in. `ndk-mobile` can take care of this for you automatically if you pass a `settingsStore` to the initialization. For example, using `expo-secure-store` you can:

```tsx
import * as SecureStore from 'expo-secure-store';

const settingsStore = {
    get: SecureStore.getItemAsync,
    set: SecureStore.setItemAsync,
    delete: SecureStore.deleteItemAsync,
    getSync: SecureStore.getItem,
};

// and then, when you initialiaze NDK:
initializeNDK({
    ......,
    settingsStore
})
```

Now, once your user logs in, their login information will be stored locally so when your app restarts, the user will be logged in automatically.

## `useNDK()`

`useNDK()` provides access to the `ndk` instance and some other useful information.

```tsx
function LoginScreen() {
    const { ndk, login } = useNDK();
    const currentUser = useNDKCurrentUser();

    useEffect(() => {
        if (currentUser) alert("you are now logged in as ", +currentUser.pubkey);
    }, [currentUser]);

    return <Button onPress={() => login(withPayload("nsec1..."))} title="Login" />;
}
```

## Example

For a real application using this look at [Olas](https://github.com/pablof7z/snapstr).
