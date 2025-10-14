---
"@nostr-dev-kit/ndk": patch
---

Fix subscription ID length exceeding relay limits

When multiple subscriptions with custom subId values were grouped together, NDK could generate subscription IDs exceeding 64+ characters, causing relays to reject them with "ERROR: bad req: subscription id too long".

Changes:
- Truncate individual subId parts to 10 characters maximum
- Limit combined subscription ID to 20 characters before adding random suffix
- Reduce length check threshold from 48 to 25 characters
- Final subscription IDs are now guaranteed to be ≤ 26 characters
