---
"@nostr-dev-kit/sessions": patch
---

Add optional `signer` parameter to `createAccount()` method. When provided, the method uses the existing signer instead of generating a new one, allowing callers to have access to the user's npub before creating the account (useful for creating npub.cash addresses and other pre-account operations).
