---
"@nostr-dev-kit/sessions": patch
"@nostr-dev-kit/svelte": patch
---

Fix activeUser synchronization when sessions are restored from storage

The session manager now explicitly sets `ndk.activeUser` when switching sessions, ensuring that the `activeUser:change` event fires immediately. This fixes an issue where `ndk.$currentUser` would be null even though sessions were properly restored from localStorage.

**Breaking Change**: `switchTo()` is now async and returns a Promise. Update your code to await it:

```typescript
// Before
manager.switchTo(pubkey);

// After
await manager.switchTo(pubkey);
```
