---
"@nostr-dev-kit/ndk": minor
---

Improve NIP-17 gift wrapping developer experience

- Auto-set rumor.pubkey in giftWrap() if not present - eliminates common "can't serialize event" errors
- Add AI guardrails with JSDoc warnings for common NIP-17 mistakes (signing rumors, using wrong timestamps, forgetting to publish to sender relays)
- Add runtime warning when rumor is already signed
- Improve documentation in gift-wrapping.ts with clear guidance on NIP-17 best practices
