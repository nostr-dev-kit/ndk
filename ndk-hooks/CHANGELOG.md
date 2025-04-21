# @nostr-dev-kit/ndk-hooks

## 1.1.1

### Patch Changes

- export wallet hooks separately

## 1.1.0

### Minor Changes

- Implement NDK session monitoring and storage management

## 1.0.2

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk-wallet@0.5.4

## 1.0.1

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.1
    - @nostr-dev-kit/ndk-wallet@0.5.3

## 1.0.0

### Major Changes

- 5ab19ef: feat: Refactor session management and add persistence

    - **ndk-core:** Added signer serialization (`toPayload`, `fromPayload`) and deserialization (`ndkSignerFromPayload`, `signerRegistry`) framework.
    - **ndk-hooks:** (Breaking Change) Refactored session state into `useNDKSessions` store with new management functions (`addSigner`, `startSession`, `switchToUser`, etc.), removing old session logic.
    - **ndk-mobile:** Added persistent session storage using `expo-secure-store` (`session-storage.ts`, `useSessionMonitor`, `bootNDK`). Updated `NDKNip55Signer` for serialization and registration.

### Patch Changes

- c83166a: bump
- import changes
- Updated dependencies [c83166a]
- Updated dependencies [5ab19ef]
- Updated dependencies [6e16e06]
- Updated dependencies
- Updated dependencies [5ab19ef]
    - @nostr-dev-kit/ndk-wallet@0.5.2
    - @nostr-dev-kit/ndk@2.14.0
