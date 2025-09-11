---
"@nostr-dev-kit/ndk": patch
---

Add ContentTaggingOptions for flexible content tagging control

- Introduces ContentTaggingOptions interface to customize tag generation behavior
- Adds options to control reply tag inclusion (includeReplyTags)
- Adds configurable hashtag prefixes via hashtagPrefixes option
- Maintains backward compatibility with existing tag method signatures
- Includes comprehensive test coverage for new tagging options