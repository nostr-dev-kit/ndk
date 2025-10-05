---
"@nostr-dev-kit/sessions": minor
---

Add read-only session support

Sessions can now be created using just an NDKUser (without a signer) for read-only access to user data. This allows viewing profiles, follows, mute lists, and other public data without requiring private key access.

- Sessions created with just an NDKUser are automatically read-only
- Added `isReadOnly(pubkey?)` method to check if a session has signer access
- Read-only sessions can fetch all public data but cannot sign or publish events
- When a read-only session is active, `ndk.signer` remains undefined