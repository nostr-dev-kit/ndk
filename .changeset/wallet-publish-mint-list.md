---
"@nostr-dev-kit/wallet": patch
"@nostr-dev-kit/svelte": patch
---

Add `publishMintList()` method to NDKCashuWallet for simplified CashuMintList (kind 10019) publishing. The svelte wallet store's `save()` method now automatically publishes both the wallet configuration (kind 17375) and the mint list (kind 10019) for nutzap reception, eliminating the need for manual mint list creation.
