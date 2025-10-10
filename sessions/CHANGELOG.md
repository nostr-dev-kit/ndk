# @nostr-dev-kit/sessions

## 0.3.2

### Patch Changes

- bump

## 0.3.1

### Patch Changes

- bump
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.1

## 0.3.0

### Minor Changes

- 344c313: Remove profile support and improve event handling
    - **BREAKING**: Removed `profile` field from `NDKSession`, `SessionStartOptions`, and `SerializedSession` interfaces
    - **BREAKING**: Removed `profile` option from login - profiles should be fetched separately if needed
    - Removed redundant `shouldStartFetching` check - `startSession` now handles empty options properly
    - Use `NDKKind` constants instead of raw numbers for better type safety
    - Use `NDKRelayList` wrapper for relay list parsing instead of manual implementation
    - Updated documentation with all supported session options

### Patch Changes

- 344c313: Fix duplicate event processing in session store. Previously, every incoming replaceable event would trigger a store update even if it was the same event or an older version, causing subscribers to be notified unnecessarily. This led to issues like wallet being instantiated multiple times for the same event.

    Now all event handlers (contacts, mutes, blocked relays, relay lists, and generic replaceable events) check if the event already exists and skip processing if:
    - It's the exact same event (same event ID)
    - It's an older event (lower created_at timestamp)

    This significantly reduces unnecessary reactivity in downstream subscribers like the wallet store.

- Updated dependencies [344c313]
- Updated dependencies [344c313]
    - @nostr-dev-kit/ndk@2.17.0

## 0.2.0

### Minor Changes

- 4b71e74: Add read-only session support

    Sessions can now be created using just an NDKUser (without a signer) for read-only access to user data. This allows viewing profiles, follows, mute lists, and other public data without requiring private key access.
    - Sessions created with just an NDKUser are automatically read-only
    - Added `isReadOnly(pubkey?)` method to check if a session has signer access
    - Read-only sessions can fetch all public data but cannot sign or publish events
    - When a read-only session is active, `ndk.signer` remains undefined

### Patch Changes

- Updated dependencies [a912a2c]
    - @nostr-dev-kit/ndk@2.15.3

## 0.1.1

### Patch Changes

- bump

## 0.1.0

### Minor Changes

- Initial release of @nostr-dev-kit/sessions - Framework-agnostic session management for NDK
    - Multi-account support with login/logout/switch functionality
    - Flexible persistence layer (LocalStorage, FileStorage, MemoryStorage)
    - Auto-save with debouncing
    - Framework-agnostic Zustand vanilla store
    - Full TypeScript support
    - Signer serialization using NDK's built-in toPayload/fromPayload
    - Comprehensive test coverage
