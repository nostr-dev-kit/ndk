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

Once you have imported the library, you can use the `NDKProvider` to wrap your application. Pass as props all the typical arguments you would pass to an `new NDK()` call.

```tsx
function App() {
    return <NDKProvider explicitRelayUrls={["wss://f7z.io"]}>{/* your app here */}</NDKProvider>;
}
```

## useNDK()

`useNDK()` provides access to the `ndk` instance and some other useful information.

```tsx
function LoginScreen() {
    const { ndk, currentUser, login } = useNDK();

    useEffect(() => {
        if (currentUser) alert("you are now logged in as ", +currentUser.pubkey);
    }, [currentUser]);

    return <Button onPress={() => login(withPayload("nsec1..."))} title="Login" />;
}
```

## Example

There is a barebones repository showing how to use this library:
[ndk-mobile-sample](https://github.com/pablof7z/ndk-mobile-sample).

For a real application using this look at [Olas](https://github.com/pablof7z/snapstr).
