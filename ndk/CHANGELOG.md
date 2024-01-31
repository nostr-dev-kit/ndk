# @nostr-dev-kit/ndk

## 2.4.0

### Minor Changes

-   b9bbf1d: Safely embrace the chaos: event validation

## 2.3.3

### Patch Changes

-   Introduce new concept of groupableDelayType which describes how the delay should be interpreted ("at least" or "at most")
-   885b6c2: Add nip46 support to nip05 responses
-   5666d56: Fix bug where authors where being added to rewritten filters who weren't included in the original filter

## 2.3.2

### Patch Changes

-   NIP-96 support
-   4628481: Improve NIP-31 support
-   Make zap more fault-tolerant

## 2.3.1

### Patch Changes

-   ece965f: Add support for NIP-46 create_account and bring NIP-46 into compliance with the rewritten NIP

## 2.3.0

### Minor Changes

-   46b0c77: AUTH policies to pre-program how NIP-42 requests should be handled

### Patch Changes

-   54cec78: Allow flagging a relay as auth_required and add "relay:ready" event
-   ef61d83: Trust, don't verify -- Allow setting relays/subscriptions as trusted to skip signature verification
-   98b77dd: fix bug of reconnecting subscriptions when the relay of an active subscription comes back
-   082e243: NIP-05 cache

## 2.2.0

### Minor Changes

-   fix long subscription IDs bug

## 2.1.3

### Patch Changes

-   180d774: update client tag to new format of NIP-89
-   7f00c40: expose some internals and decouple zapping request generation

## 2.1.2

### Patch Changes

-   default to creating nicer looking d-tags for nip-33 events with a title
-   allow using a different kind to manage replaceable contact lists

## 2.1.1

### Patch Changes

-   Version bump

## 2.1.0

### Minor Changes

-   New NIP-46 implementation with auth_url flow

## 2.0.6

### Patch Changes

-   Add relay hint to tagging via tagReference
-   fix tagging and add more tests

## 2.0.5

### Patch Changes

-   d45d962: update DVM job kinds
-   Update names to new NIP-51
-   d45d962: update DVM job kinds

## 2.0.4

### Patch Changes

-   -   Improves content tagging
    -   adds mention and relay URL tags
    -   adds replaceable event mention tagging

## 2.0.3

### Patch Changes

-   add react method to events

## 2.0.2

### Patch Changes

-   Static references for replaceable events

## 2.0.0

### Major Changes

-   Load and flag muted events

## 1.4.2

### Patch Changes

-   Make NIP-07 signer handle better a not-yet-loaded signing extension

## 1.4.1

### Patch Changes

-   Automatically fetch main users relays and connect to them

## 1.4.0

### Minor Changes

-   add hashtag support to content tagger

## 1.3.2

### Patch Changes

-   b3561af: Don't wait for OK on ephemeral events

## 1.3.1

### Patch Changes

-   Fix issue when publishing to an explicit relay set where one of the relays is offline

## 1.3.0

### Minor Changes

-   cf4a648: Support fetching events from NIP-33 `a` tags
-   3946078: User npub/hexpubkey become optional. This means that if you refer to aser by their
    hexpubkey, npub won't be computed until it's necessary.

    This is a breaking change since hexpubkey goes from being called as function (`hexpubkey()`) to a getter (`hexpubkey`).

-   3440768: User profile dedicated cache

### Patch Changes

-   88df10a: Throw when a user is instantiated without both an npub and pubkey
-   c225094: Fetching a relay list from a user will now also inspect kind:3 if the user doesn't have a NIP-65 set
