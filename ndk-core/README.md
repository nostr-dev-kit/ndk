# @nostr-dev-kit/ndk

 [![npm version](https://img.shields.io/npm/v/@nostr-dev-kit/ndk.svg)](https://www.npmjs.com/package/@nostr-dev-kit/ndk)
 [![Build Status](https://github.com/nostr-dev-kit/ndk/actions/workflows/deploy.yml/badge.svg)](https://github.com/nostr-dev-kit/ndk/actions)

 > NDK (Nostr Development Kit) is a TypeScript/JavaScript library that simplifies building Nostr clients, relays, and related applications.

 ## Features

 - Outbox model support
 - Relay connection pool with automatic reconnection and failover
 - Flexible subscription API with caching, batching, and auto-closing
 - Event creation, validation, and wrappers for major NIPs (e.g., NIP-01, NIP-04, NIP-07, NIP-18, NIP-57, NIP-60, NIP-61)
 - Signer adapters: private key, browser extension (NIP-07), remote signing (NIP-46)
 - Pluggable cache adapters (Redis, Dexie, SQLite, etc.)
 - Data Vending Machine support (NIP-90)
 - Zap utilities (NIP-57, NIP-61)
 - Threading, event kinds, and utility functions (URL normalization, metadata tags, filters)
 - Modular design with many pluggable packages for different frameworks (Mobile, Svelte 4 and 5, React)

 ## Installation

 ```bash
 npm install @nostr-dev-kit/ndk
 # or
 yarn add @nostr-dev-kit/ndk
 # or
 bun add @nostr-dev-kit/ndk
 ```

 ## Quick Start

 ```typescript
 import NDK, { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

 async function main() {
   const signer = NDKPrivateKeySigner.generate();
   const ndk = new NDK({
     explicitRelayUrls: ['wss://relay.primal.net'],
     signer
   });

   // Connect to relays
   await ndk.connect();

   // Publish a simple text note
   const event = new NDKEvent(ndk, {
     kind: 1,
     content: 'Hello Nostr via NDK!',
   })
   await event.sign();
   event.publish();

  // subscribe to all event interactions
   ndk.subscribe(event.filter(), { closeOnEose: false }, {
    onEvent: (replyEvent: NDKEvent) => console.log(replyEvent.author.npub, "interacted with our hello world with a kind", replyEvent.kind);
   })

   // Subscribe to incoming text notes
   const subscription = ndk.subscribe(
     { kinds: [1] },
     { closeOnEose: true },
     {
       onEvent: (evt) => console.log('Received event:', evt),
       onEose: () => console.log('End of stream'),
     }
   );
 }

 main().catch(console.error);
 ```

 ## Documentation

 Full API reference and guides are available at [https://nostr-dev-kit.github.io/ndk](https://nostr-dev-kit.github.io/ndk).

 ## License

 MIT