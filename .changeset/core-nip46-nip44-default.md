---
"@nostr-dev-kit/ndk": patch
---

Change NIP-46 default encryption from NIP-04 to NIP-44. NIP-44 is the newer, more secure encryption standard and is now used by default in modern bunker implementations. The RPC layer automatically falls back to NIP-04 when needed for compatibility.
