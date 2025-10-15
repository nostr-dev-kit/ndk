---
"@nostr-dev-kit/ndk": patch
---

Replace nostr-tools dependency with native NIP-57 zap request implementation

Removed dependency on nostr-tools' `makeZapRequest` function and implemented native NIP-57 compliant zap request generation. This provides better control over the implementation and adds support for the optional `k` tag (event kind) in zap requests for improved compatibility with modern nostr implementations.

Changes:
- Native implementation of kind 9734 zap request generation
- Added `k` tag support for event zaps (per NIP-57 specification)
- Comprehensive test coverage for all zap request scenarios
- No breaking changes to the public API
