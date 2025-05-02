# @nostr-dev-kit/ndk-hooks

## 1.1.25

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.6
    - @nostr-dev-kit/ndk-wallet@0.5.10

## 1.1.24

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.5
    - @nostr-dev-kit/ndk-wallet@0.5.9

## 1.1.23

### Patch Changes

- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.4
    - @nostr-dev-kit/ndk-wallet@0.5.8

## 1.1.22

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.3
    - @nostr-dev-kit/ndk-wallet@0.5.7

## 1.1.21

### Patch Changes

- bump

## 1.1.20

### Patch Changes

- refactor: fix issue with muteable items being confused between Hexpubkey and strings

## 1.1.19

### Patch Changes

- add way to get current mute list from the store

## 1.1.18

### Patch Changes

- improve mutes ergonomics and documentation

## 1.1.17

### Patch Changes

- remove some debugging and code cleanup

## 1.1.16

### Patch Changes

- bump

## 1.1.15

### Patch Changes

- bump

## 1.1.14

### Patch Changes

- make mute calculation more efficient

## 1.1.13

### Patch Changes

- add subOptions to fetch profiles

## 1.1.12

### Patch Changes

- Enhance mute functionality with application-level extra mutes

## 1.1.11

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk-wallet@0.5.6

## 1.1.10

### Patch Changes

- move peerdependency

## 1.1.9

### Patch Changes

- redo imports

## 1.1.7

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.2
    - @nostr-dev-kit/ndk-wallet@0.5.5

## 1.1.6

### Patch Changes

- bump

## 1.1.5

### Patch Changes

- update docs

## 1.1.3

### Patch Changes

- fiddle with exports

## 1.1.3

### Patch Changes

- fix exports

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
