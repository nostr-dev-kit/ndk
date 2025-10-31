---
"@nostr-dev-kit/sessions": patch
---

Fix race condition in removeSession that prevented ndk.activeUser from being cleared on logout. The issue was caused by NDK's async signer setter which queues a promise that sets activeUser after state is cleared. Fixed by clearing NDK state (signer, activeUser) before triggering subscriptions, preventing the async side effect from firing.
