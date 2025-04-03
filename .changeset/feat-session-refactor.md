---
'@nostr-dev-kit/ndk-core': minor
'@nostr-dev-kit/ndk-hooks': major
'@nostr-dev-kit/ndk-mobile': minor
---

feat: Refactor session management and add persistence

- **ndk-core:** Added signer serialization (`toPayload`, `fromPayload`) and deserialization (`ndkSignerFromPayload`, `signerRegistry`) framework.
- **ndk-hooks:** (Breaking Change) Refactored session state into `useNDKSessions` store with new management functions (`addSigner`, `startSession`, `switchToUser`, etc.), removing old session logic.
- **ndk-mobile:** Added persistent session storage using `expo-secure-store` (`session-storage.ts`, `useSessionMonitor`, `bootNDK`). Updated `NDKNip55Signer` for serialization and registration.