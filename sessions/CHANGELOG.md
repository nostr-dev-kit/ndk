# @nostr-dev-kit/sessions

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
