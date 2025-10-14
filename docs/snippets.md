# Code Snippets

This section contains a growing collection of code snippets demonstrating how to perform specific tasks with NDK. 
Each snippet is focused on a single, targeted use case to help you find solutions for common implementation needs.

Snippets are grouped by category. Some of them are listed in more than one category.

## Events

### Creating a basic event

<<< @/core/docs/snippets/create_event.ts

### Tagging users

<<< @/core/docs/snippets/tag_user.ts

### Signing events

<<< @/core/docs/snippets/sign_event.ts

## Signers

### Signing events

<<< @/core/docs/snippets/sign_event.ts

### Different signers

<<< @/core/docs/snippets/sign_event_with_other_signers.ts


## Not migrated yet


- [User](./user/)
    - [Generate Keys](./user/generate-keys.md) - Generate a new key pair and obtain all formats (private key, public key, nsec, npub)
    - [Get Profile](./user/get-profile.md) - Fetch and handle user profile information
- [Mobile](./mobile/)
    - [Basics]
        - [Initialize NDK + SQLite cache](./mobile/ndk/initializing-ndk.md) - Set up NDK with SQLite caching for mobile apps
    - [User](./mobile/user/)
        - [Loading User Profiles](./mobile/user/loading-user-profiles.md) - Efficiently load and cache user profiles in mobile apps
    - [Events](./mobile/events/)
        - [Rendering Event Content](./mobile/events/rendering-event-content.md) - Rich text rendering of Nostr event content with mentions, hashtags, and media
    - [Session](./mobile/session/)
        - [Login](./mobile/session/login.md) - Handle user authentication with NDK Mobile using various methods (NIP-46, nsec)
- [Wallet](./wallet/)
    - [Connect Nostr Wallet Connect](./wallet/connect-nwc.md) - Connect to an NWC wallet and set it up for zapping
    - [Using Cashu Wallet](./wallet/using-cashu-wallet.md) - Create and use a Cashu wallet for managing e-cash tokens
    - [Nutzap Monitor](./wallet/nutzap-monitor.md) - Track and process Cashu tokens sent via Nostr zaps
    - [Cashu Deposits](./wallet/cashu-deposits.md) - Fund your Cashu wallet using Lightning invoices
- [Testing](./testing/)
    - [Mock Relays](./testing/mock-relays.md) - Create and use mock relays for testing NDK applications
    - [Event Generation](./testing/event-generation.md) - Generate test events with different kinds and content
    - [Nutzap Testing](./testing/nutzap-testing.md) - Test Cashu token and Nutzap functionality
    - [Relay Pool Testing](./testing/relay-pool-testing.md) - Test relay pool behavior and event handling