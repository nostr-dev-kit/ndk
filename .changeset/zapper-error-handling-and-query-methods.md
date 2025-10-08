---
"@nostr-dev-kit/ndk": minor
"@nostr-dev-kit/svelte": patch
---

Fix zap error handling and add method to query recipient payment methods

- Fixed NDKZapper.zap() to properly throw errors when all payment attempts fail
- Added getRecipientZapMethods() to query what payment methods recipients accept
- Enhanced svelte zap function to log partial failures
- Updated zap documentation with error handling and method querying examples
