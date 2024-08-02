# @nostr-dev-kit/ndk

## 2.10.0

### Minor Changes

-   Massive refactor of how subscriptions are fingerprinted, grouped, ungrouped and their internal lifecycle

### Patch Changes

-   ec83ddc: fix: close subscription on EOSE at the relay level
-   18c55bb: fix bug where queued items were not getting processed (e.g. zap fetches)
-   refactor outbox and be smarter abotu the relays we publish to (account for p-tags and relay hints)
-   18c55bb: Breaking change: event.zap is now removed, use ndk.zap(event) instead
-   add filterForEventsTaggingId
-   3029124: add methods to access and manage unpublished events from the cache

## 2.9.1

### Patch Changes

-   when a root event is not marked, try to use a reply tag

## 2.9.0

### Minor Changes

-   94018b4: add optimistic updates

### Patch Changes

-   548f4d8: add optimistic updates

## 2.8.2

### Patch Changes

-   0af033f: allow scheduling more than one event
-   cache relay reconnection status

## 2.8.1

### Patch Changes

-   e40312b: get all profiles that match a filter function from a cahce
-   support deprecated replies

## 2.8.0

### Minor Changes

-   all-around massive performance improvements

### Patch Changes

-   91d873c: allow offloading signature verification to an async web worker
-   6fd9ddc: threading utility functions
-   0b8f331: fix unfollow function
-   optimize serialization and avoid grouping subscriptions that will not close with those that do
-   f2898ad: handle more reply cases
-   9b92cd9: Increase performance of signature verification
-   allow forcing a tag (for q tagging)
-   6814f0c: fix event fetching from tag when there is no relay hint
-   89b5b3f: nip46 fixes on create_account
-   9b92cd9: fix incorrect tagging when quoting an event
-   27b10cc: correct timestamp of bad events
-   fix race condition when using synchronous cache
-   ed7cdc4: avoid verifying signatures of cached events

## 2.7.1

### Patch Changes

-   fix missing zap spec return

## 2.7.0

### Minor Changes

-   Aggregate, cache, deduplicate NIP-05 queries and Zap settings queries -- Massive performance improvement!

### Patch Changes

-   Add thread utility functions
-   Provide utility functions to make threading events and reply chains way easier

## 2.6.1

### Patch Changes

-   error handle url normalization

## 2.6.0

### Minor Changes

-   Make outbox calculation great again

### Patch Changes

-   Refactor OutboxTracker to handle tracking users in batches
-   c2db3c1: Support blocked relays
-   c2db3c1: notify caches when events are deleted
-   c2db3c1: URL normalization

## 2.5.1

### Patch Changes

-   Use nicer reconnection timer
-   Fixes fetching of nip46 relays in nip05 implementation (#186)

## 2.5.0

### Minor Changes

-   e08fc74: Nostr Wallet Connect support

## 2.4.1

### Patch Changes

-   111c1ea: Add DVM post scheduling
-   5c0ae51: Track all relays the event is seen and encode multiple relays on nevents
-   6f5ea49: bug fix: don't force Article kind
-   3738d39: Big NIP-29 and NIP-88 changes
-   d22239a: Add a way to get events inside a list

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
