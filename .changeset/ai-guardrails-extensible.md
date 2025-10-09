---
"@nostr-dev-kit/ndk": minor
"@nostr-dev-kit/svelte": minor
---

Refactor AI guardrails to be extensible and clean

- Remove inline guardrail checks from core business logic (88+ lines reduced to simple announcements)
- Create organized guardrail modules with individual check functions
- Add registration system for external packages to provide their own guardrails
- Business logic now cleanly announces actions without embedding validation
- NDKSvelte warns when instantiated without session parameter
