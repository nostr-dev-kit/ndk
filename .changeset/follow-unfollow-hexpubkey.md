---
"@nostr-dev-kit/ndk": minor
---

Allow follow/unfollow methods to accept hex pubkeys directly

The `follow` and `unfollow` methods now accept both `NDKUser` objects and hex pubkey strings for both the target user and the `currentFollowList` parameter. This provides more flexibility when working with follow lists, allowing direct use of pubkey strings without needing to wrap them in NDKUser objects.
