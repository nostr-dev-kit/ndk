# NDK Mobile

A React Native/Expo implementation of [NDK (Nostr Development Kit)](https://github.com/nostr-dev-kit/ndk) that provides a complete toolkit for building Nostr applications on mobile platforms.

## Features

-   🔐 Multiple signer implementations supported via NDK Core (NIP-07, NIP-46, Private Key) and NDK Mobile (NIP-55).
-   💾 SQLite-based caching for offline support (`NDKCacheAdapterSqlite`).
-   🔄 Subscription management with automatic reconnection.
-   📱 React Native and Expo compatibility.
-   🪝 React hooks for easy state management (`useNDKStore`, `useNDKSessions`, `useSubscribe`, etc. via `@nostr-dev-kit/react`).
-   👛 Integrated wallet support (via `@nostr-dev-kit/ndk-wallet`).
-   🔄 **Persistent Sessions:** Automatically saves and loads user sessions and signers using `expo-secure-store`.

## Installation

```sh
# Install NDK Core, Hooks, Wallet, and Mobile
npm install @nostr-dev-kit/ndk @nostr-dev-kit/react @nostr-dev-kit/ndk-wallet @nostr-dev-kit/mobile expo-secure-store react-native-get-random-values @bacons/text-decoder expo-sqlite expo-crypto expo-file-system
# Ensure peer dependencies for expo-sqlite are met
npm install expo-sqlite/next
```
*Note: Ensure all necessary peer dependencies for Expo modules like `expo-sqlite` are installed.*

## Usage

When using this library, you primarily interact with the core `NDK` instance and hooks from `@nostr-dev-kit/react`. `ndk-mobile` provides the `NDKCacheAdapterSqlite` for persistence, the `useSessionMonitor` hook for automatic session persistence, and the NIP-55 signer.

## Example

For a real application using this look at [Olas](https://github.com/pablof7z/olas).
