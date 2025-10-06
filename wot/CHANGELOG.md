# @nostr-dev-kit/wot

## 0.2.7

### Patch Changes

- b7e7f92: Add pubkey validation in constructor and p-tag parsing to prevent invalid pubkeys from causing issues
- Updated dependencies [b7e7f92]
    - @nostr-dev-kit/ndk@2.17.1

## 0.2.1

### Patch Changes

- fix: validate root pubkey in NDKWoT constructor

    Added validation to ensure the root pubkey passed to NDKWoT constructor is a valid 64-character hex string. This prevents invalid pubkeys from being used in filter authors arrays, which would cause errors when building the WoT graph at depth > 0.

    The validation happens in the constructor and throws an error with a clear message if an invalid pubkey is provided. This catches issues early rather than failing deep in the fetchEvents call.

## 0.2.0

### Minor Changes

- Initial release of @nostr-dev-kit/wot - Web of Trust utilities for NDK

    Features:
    - Build WoT graph from contact lists with configurable depth
    - Calculate WoT scores and distances for pubkeys
    - Filter and rank events by WoT
    - Reference counting and follower tracking
    - Efficient graph traversal with timeout support

## 0.1.1

### Patch Changes

- bump
