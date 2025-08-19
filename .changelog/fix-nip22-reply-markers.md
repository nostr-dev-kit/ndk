---
"ndk-core": patch
---

Fix NIP-22 reply tags to not include markers

The reply() method was incorrectly including markers in NIP-22 compliant tags. NIP-22 defines e/E and a/A tags without markers, instead using uppercase tags to indicate importance. This fix ensures proper tag structure for NIP-22 replies by removing marker parameters and correctly formatting tags as:
- For regular events: ["e", eventId, relayHint, pubkey] and ["E", eventId, relayHint, pubkey]
- For addressable events: ["a", address, relayHint] and ["A", address, relayHint]