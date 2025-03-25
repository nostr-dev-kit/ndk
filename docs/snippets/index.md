# Code Snippets

This section contains a growing collection of code snippets demonstrating how to perform specific tasks with NDK. Each snippet is focused on a single, targeted use case to help you quickly find solutions for common implementation needs.

## Categories

Snippets are organized into the following categories:

- [User](./user/)
    - [Generate Keys](./user/generate-keys.md) - Generate a new key pair and obtain all formats (private key, public key, nsec, npub)
    - [Get Profile](./user/get-profile.md) - Fetch and handle user profile information
- [Event](./event/)
    - [Basic](./event/basic.md) - Generate a basic Nostr event
    - [Tagging Users and Events](./event/tagging-users-and-events.md) - Add tags to mention users and events
- [Mobile](./mobile/)
    - [Basics]
        - [Initialize NDK + SQLite cache](./mobile/ndk/initializing-ndk.md) - Set up NDK with SQLite caching for mobile apps
    - [User](./mobile/user/)
        - [Loading User Profiles](./mobile/user/loading-user-profiles.md) - Efficiently load and cache user profiles in mobile apps
    - [Events](./mobile/events/)
        - [Rendering Event Content](./mobile/events/rendering-event-content.md) - Rich text rendering of Nostr event content with mentions, hashtags, and media
    - [Session](./mobile/session/)
        - [Login](./mobile/session/login.md) - Handle user authentication with NDK Mobile using various methods (NIP-46, nsec)
