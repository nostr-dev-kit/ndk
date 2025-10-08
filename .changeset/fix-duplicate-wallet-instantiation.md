---
"@nostr-dev-kit/sessions": patch
---

Fix duplicate event processing in session store. Previously, every incoming replaceable event would trigger a store update even if it was the same event or an older version, causing subscribers to be notified unnecessarily. This led to issues like wallet being instantiated multiple times for the same event.

Now all event handlers (contacts, mutes, blocked relays, relay lists, and generic replaceable events) check if the event already exists and skip processing if:
- It's the exact same event (same event ID)
- It's an older event (lower created_at timestamp)

This significantly reduces unnecessary reactivity in downstream subscribers like the wallet store.
