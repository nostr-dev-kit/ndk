# @nostr-dev-kit/ndk-mobile

## 0.6.4

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk-hooks@1.1.1

## 0.6.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk-hooks@1.1.0

## 0.6.2

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk-wallet@0.5.4
    - @nostr-dev-kit/ndk-hooks@1.0.2

## 0.6.1

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.1
    - @nostr-dev-kit/ndk-hooks@1.0.1
    - @nostr-dev-kit/ndk-wallet@0.5.3

## 0.6.0

### Minor Changes

- 5ab19ef: feat: Refactor session management and add persistence

    - **ndk-core:** Added signer serialization (`toPayload`, `fromPayload`) and deserialization (`ndkSignerFromPayload`, `signerRegistry`) framework.
    - **ndk-hooks:** (Breaking Change) Refactored session state into `useNDKSessions` store with new management functions (`addSigner`, `startSession`, `switchToUser`, etc.), removing old session logic.
    - **ndk-mobile:** Added persistent session storage using `expo-secure-store` (`session-storage.ts`, `useSessionMonitor`, `bootNDK`). Updated `NDKNip55Signer` for serialization and registration.

### Patch Changes

- c83166a: bump
- 6e16e06: Enhance SQLite adapter to support decrypted events storage and retrieval.
- import changes
- df73b9b: add <EventContent> component
- Updated dependencies [c83166a]
- Updated dependencies [5ab19ef]
- Updated dependencies [6e16e06]
- Updated dependencies
- Updated dependencies [5ab19ef]
    - @nostr-dev-kit/ndk-wallet@0.5.2
    - @nostr-dev-kit/ndk-hooks@1.0.0
    - @nostr-dev-kit/ndk@2.14.0

## 2.3.1-rc1.0

### Patch Changes

- add <EventContent> component

## 0.4.4

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk-wallet@0.5.0

## 0.4.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.12.2
    - @nostr-dev-kit/ndk-wallet@0.4.3

## 0.4.2

### Patch Changes

- sqlite search profile support
- e667a60: store parsed profile in sqlite adapter
- Updated dependencies [3ea9695]
- Updated dependencies [cca3357]
- Updated dependencies [1235f69]
    - @nostr-dev-kit/ndk@2.12.1
    - @nostr-dev-kit/ndk-wallet@0.4.2

## 0.4.1

### Patch Changes

- d87d886: Leverage synchronous cache adapter to load events in one go in useSubscribe hook
- Updated dependencies [f255a07]
- Updated dependencies [f255a07]
- Updated dependencies [2171140]
- Updated dependencies [72c8492]
- Updated dependencies [72c8492]
    - @nostr-dev-kit/ndk@2.12.0
    - @nostr-dev-kit/ndk-wallet@0.4.1

## 0.4.0

### Minor Changes

- changes to the initialization hook to allow for more fine grained database initialization logic

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.11.2
    - @nostr-dev-kit/ndk-wallet@0.4.0

## 0.3.0

### Minor Changes

- NIP-55 support (thanks to nostr:npub1ehhfg09mr8z34wz85ek46a6rww4f7c7jsujxhdvmpqnl5hnrwsqq2szjqv !)

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.11.1
    - @nostr-dev-kit/ndk-wallet@0.3.17

## 0.2.2

### Patch Changes

- f2b307d: add useUserProfile hook
- 6b3ea8b: add LRU cache for profiles
- 1301db9: add sync profile fetching from cache
- Updated dependencies [35987be]
- Updated dependencies [689305c]
- Updated dependencies [35987be]
- Updated dependencies [35987be]
- Updated dependencies [689305c]
- Updated dependencies
- Updated dependencies [4ed75a6]
    - @nostr-dev-kit/ndk@2.11.0
    - @nostr-dev-kit/ndk-wallet@0.3.16

## 0.2.1

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.10.7
    - @nostr-dev-kit/ndk-wallet@0.3.15

## 0.2.0

### Minor Changes

- add the very handy useNDKSessionEventKind

## 0.1.5

### Patch Changes

- add default export
