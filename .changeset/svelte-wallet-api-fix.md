---
"@nostr-dev-kit/svelte": patch
---

Fix wallet store API: `mints` now returns `string[]` of configured mint URLs (not filtered by balance), and add `mintBalances` getter that returns all mints with their balances including configured mints with 0 balance
