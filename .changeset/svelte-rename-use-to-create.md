---
"@nostr-dev-kit/svelte": major
"@nostr-dev-kit/cache-sqlite-wasm": major
"@nostr-dev-kit/ndk": major
---

BREAKING: Rename all use* functions to create* for consistency

All reactive utilities now consistently use the `create*` prefix to match Svelte idioms (like `createEventDispatcher`).

**Svelte package renames:**
- `useZapAmount` → `createZapAmount`
- `useIsZapped` → `createIsZapped`
- `useTargetTransactions` → `createTargetTransactions`
- `usePendingPayments` → `createPendingPayments`
- `useTransactions` → `createTransactions`
- `useWoTScore` → `createWoTScore`
- `useWoTDistance` → `createWoTDistance`
- `useIsInWoT` → `createIsInWoT`
- `useZapInfo` → `createZapInfo`
- `useBlossomUpload` → `createBlossomUpload`
- `useBlossomUrl` → `createBlossomUrl`

Migration: Replace all `use*` function calls with their `create*` equivalents in your Svelte components.
