---
"@nostr-dev-kit/ndk": patch
---

Improve AI guardrails with ratio-based fetchEvents warnings

AI guardrails now track the ratio of fetchEvents to subscribe calls and only warn when fetchEvents usage exceeds 50% AND total calls exceed 6. This prevents false positives for legitimate fetchEvents usage patterns while still catching code that overuses fetchEvents when subscribe would be more appropriate.

The guardrails now:
- Track both fetchEvents and subscribe call counts
- Only warn when the ratio indicates a pattern of misuse (>50% fetchEvents with >6 total calls)
- Allow legitimate single/few fetchEvents calls without warnings
- Provide more accurate guidance for subscription-based architectures
