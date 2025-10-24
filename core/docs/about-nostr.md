# About Nostr

Nostr (Notes and Other Stuff Transmitted by Relays) is an open, censorship-resistant protocol for publishing and
subscribing to events. It’s not a platform or company—it's a simple, extensible standard that anyone can implement.

## Core Concepts

- Identities with keys:
    - You are your keys. A private key signs your messages; a public key identifies you.
    - No accounts, emails, or servers required.
- Events:
    - The atomic unit of data (notes, profiles, likes, zaps, etc.).
    - Each event is a JSON object signed by the creator’s private key.
- Relays:
    - Dumb servers that store and forward events.
    - You can publish to many relays and read from many relays.
    - Relays don’t authenticate; they verify signatures and apply their own policies.
- Clients:
    - Apps that let you create, sign, publish, and read events.
    - You can use multiple clients with the same keys—your identity is portable.

## Why Nostr?

- **Censorship resistance**: No single relay or company can silence you.
- **Portability**: Your identity and data travel with your keys.
- **Interoperability**: One protocol, many apps—social, chat, marketplaces, media.
- **Simplicity**: Minimal spec, easy to implement, composable extensions.

## Read more

- [The nostr protocol](https://github.com/nostr-protocol/nostr)
- [Network Implementation Proposals (NIPs)](https://github.com/nostr-protocol/nips)
- [Awesome Nostr](https://github.com/aljazceru/awesome-nostr)