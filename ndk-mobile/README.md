# NDK Mobile

A React Native/Expo implementation of [NDK (Nostr Development Kit)](https://github.com/nostr-dev-kit/ndk) that provides a complete toolkit for building Nostr applications on mobile platforms.

## Features

-   🔐 Multiple signer implementations (NIP-07, NIP-46, Private Key)
-   💾 SQLite-based caching for offline support
-   🔄 Subscription management with automatic reconnection
-   📱 React Native and Expo compatibility
-   🪝 React hooks for easy state management
-   👛 Integrated wallet support

## Installation

npm install @nostr-dev-kit/ndk-mobile

## Usage

When using this library don't import `@nostr-dev-kit/ndk` directly, instead import `@nostr-dev-kit/ndk-mobile`. `ndk-mobile` exports the same classes as `ndk`, so you can just swap the import.

## Example

There is a barebones repository showing how to use this library:
[ndk-mobile-sample](https://github.com/pablof7z/ndk-mobile-sample).

For a real application using this look at [Olas](https://github.com/pablof7z/snapstr).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

[@pablof7z](https://njump.me/f7z.io)
