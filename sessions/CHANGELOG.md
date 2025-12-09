# @nostr-dev-kit/sessions

## 1.0.0

### Patch Changes

- 53768a2: Fix race condition in removeSession that prevented ndk.activeUser from being cleared on logout. The issue was caused by NDK's async signer setter which queues a promise that sets activeUser after state is cleared. Fixed by clearing NDK state (signer, activeUser) before triggering subscriptions, preventing the async side effect from firing.
- Updated dependencies [53768a2]
    - @nostr-dev-kit/ndk@3.0.0
    - @nostr-dev-kit/wallet@1.0.0

## 0.6.4

### Patch Changes

- Updated dependencies [b8e7a06]
- Updated dependencies [ad7936b]
- Updated dependencies [b5bdb2c]
- Updated dependencies [4b8d146]
- Updated dependencies [8f116fa]
- Updated dependencies [b5bdb2c]
- Updated dependencies [72fc3b0]
- Updated dependencies [73adeb9]
- Updated dependencies [b5bdb2c]
    - @nostr-dev-kit/ndk@3.0.0
    - @nostr-dev-kit/wallet@0.8.11

## 0.6.3

### Patch Changes

- 6c5f645: Add optional `signer` parameter to `createAccount()` method. When provided, the method uses the existing signer instead of generating a new one, allowing callers to have access to the user's npub before creating the account (useful for creating npub.cash addresses and other pre-account operations).
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.11

## 0.6.2

### Patch Changes

- Add follows support and publish option to createAccount method
    - Added `follows` parameter to createAccount for creating kind:3 contact lists
    - Added `publish` option to control whether events are published immediately or returned signed
    - Refactored API to separate data parameters from behavior options: `createAccount(data, opts)`
    - Changed return type to always return `{ signer: NDKPrivateKeySigner; events: NDKEvent[] }`
    - Events array contains signed events when publish is false, empty array when publish is true

- Updated dependencies [eb8d400]
    - @nostr-dev-kit/ndk@2.17.10

## 0.6.1

### Patch Changes

- a6722f6: Fix activeUser synchronization when sessions are restored from storage

    The session manager now explicitly sets `ndk.activeUser` when switching sessions, ensuring that the `activeUser:change` event fires immediately. This fixes an issue where `ndk.$currentUser` would be null even though sessions were properly restored from localStorage.

    **Breaking Change**: `switchTo()` is now async and returns a Promise. Update your code to await it:

    ```typescript
    // Before
    manager.switchTo(pubkey);

    // After
    await manager.switchTo(pubkey);
    ```

## 0.6.0

### Minor Changes

- 28881de: Add ergonomic `eventConstructors` option for registering event classes

    Adds a new `eventConstructors` option to session configuration that provides a more ergonomic API for registering custom event classes. Instead of manually creating a `Map<NDKKind, Constructor>`, you can now pass an array of event class constructors that have a static `kinds` property.

    **Before:**

    ```typescript
    await sessions.login(signer, {
        events: new Map([
            [NDKKind.BlossomList, NDKBlossomList],
            [NDKKind.Article, NDKArticle],
        ]),
    });
    ```

    **After:**

    ```typescript
    await sessions.login(signer, {
        eventConstructors: [NDKBlossomList, NDKArticle],
    });
    ```

    The implementation uses the static `kinds` property on each constructor to automatically map kinds to their constructors. Both options can be used together and will be merged.

## 0.5.0

### Minor Changes

- Add ergonomic `eventConstructors` option for registering event classes

    Adds a new `eventConstructors` option to session configuration that provides a more ergonomic API for registering custom event classes. Instead of manually creating a `Map<NDKKind, Constructor>`, you can now pass an array of event class constructors that have a static `kinds` property.

    **Before:**

    ```typescript
    await sessions.login(signer, {
        events: new Map([
            [NDKKind.BlossomList, NDKBlossomList],
            [NDKKind.Article, NDKArticle],
        ]),
    });
    ```

    **After:**

    ```typescript
    await sessions.login(signer, {
        eventConstructors: [NDKBlossomList, NDKArticle],
    });
    ```

    The implementation uses the static `kinds` property on each constructor to automatically map kinds to their constructors. Both options can be used together and will be merged.

### Patch Changes

- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.6

## 0.4.2

### Patch Changes

- Fix zustand bundling issue causing React import errors in non-React environments by marking zustand as external dependency

## 0.4.1

### Patch Changes

- Update @nostr-dev-kit/ndk dependency to ^2.17.3

## 0.4.0

### Minor Changes

- Add runtime wallet control with persistent preferences

    Sessions now supports runtime control of wallet fetching with persistent user preferences:
    - `enableWallet(pubkey?)` - Enable wallet fetching and save preference
    - `disableWallet(pubkey?)` - Disable wallet fetching and save preference
    - `isWalletEnabled(pubkey?)` - Check if wallet is enabled for a session

    This allows apps to:
    1. Ask users for consent before enabling wallet features
    2. Remember user's wallet preference across sessions
    3. Have different wallet settings per account

    Preferences are automatically persisted and restored with sessions.

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
