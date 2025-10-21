---
"@nostr-dev-kit/ndk": patch
---

Remove single event ID lookup warning from AI guardrails

Removed the overly strict warning that suggested using fetchEvent() for single ID lookups with fetchEvents(). This allows more flexibility when intentionally using fetchEvents() for single event queries.
