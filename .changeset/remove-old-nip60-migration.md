---
"@nostr-dev-kit/ndk": patch
"@nostr-dev-kit/ndk-wallet": patch
---

Remove old NIP-60 migration code and legacy wallet kind 37375

- Removed `getOldWallets` function and `migrateCashuWallet` from ndk-wallet
- Removed `LegacyCashuWallet = 37375` kind definition from ndk-core
- Cleaned up all references to the legacy migration code