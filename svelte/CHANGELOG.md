# Changelog

## Unreleased

### Breaking Changes

- **REMOVED: UI/Action builders moved to registry-only** - The following builders have been removed from the `@nostr-dev-kit/svelte` package exports and are now only available in the registry as reference implementations:

  **Removed action builder exports:**
  - `createFollowAction`, `createReactionAction`, `createReplyAction`, `createRepostAction`, `createMuteAction`
  - `createEmojiPicker`
  - Related types: `FollowActionConfig`, `ReactionActionConfig`, `ReplyActionConfig`, `RepostActionConfig`, `MuteActionConfig`, `EmojiReaction`, `EmojiData`, `EmojiPickerConfig`, `ReplyStats`, `RepostStats`

  **Removed complex builder exports:**
  - `createThreadView` and types: `ThreadView`, `ThreadNode`, `CreateThreadViewOptions`, `ThreadingMetadata`
  - `createHighlight` and types: `HighlightConfig`, `HighlightState`, `HighlightPosition`, `SourceInfo`, `UrlMetadata`
  - `createZapSendAction` and types: `ZapSendActionConfig`, `ZapSendSplit`
  - `createBookmarkedRelayList` and types: `BookmarkedRelayListState`, `BookmarkedRelayWithStats`
  - `createAvatarGroup` and types: `AvatarGroupConfig`, `AvatarGroupState`
  - `createUserInput` and types: `UserInputConfig`, `UserInputResult`

  **Remaining core exports:**
  The package now only exports these core primitives:
  - `createFetchEvent` - Fetch and track individual events
  - `createProfileFetcher` - Fetch and track user profiles
  - `createRelayInfo` - Fetch relay information documents

  **Migration:** If you were importing action or UI builders from `@nostr-dev-kit/svelte`, copy the implementation from the registry into your project. These builders are UI-specific and better suited as reference implementations rather than library exports.

- **REMOVED: Payment tracking infrastructure** - Removed `$payments` store and all payment tracking functionality (`src/lib/payments/`) as it was not fully integrated with the rest of the system. The wallet store (`$wallet`) remains fully functional for Cashu, NWC, and WebLN wallet operations.

  **Removed exports:**
  - `createIsZapped`, `createPendingPayments`, `createTargetTransactions`, `createTransactions`, `createZapAmount` runes
  - `PendingPayment`, `Transaction`, `TransactionDirection`, `TransactionStatus`, `TransactionType` types
  - `ReactivePaymentsStore` type
  - `ndk.$payments` property

  **Migration:** Remove any references to `ndk.$payments` from your code. Wallet functionality (`ndk.$wallet`) continues to work as before.

## 4.0.0

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@3.0.0

## 4.0.0

### Major Changes

- b5bdb2c: BREAKING: Rename all use* functions to create* for consistency

    All reactive utilities now consistently use the `create*` prefix to match Svelte idioms (like `createEventDispatcher`).

    **Svelte package renames:**
    - `useZapAmount` → `createZapAmount`
    - `useIsZapped` → `createIsZapped`
    - `useTargetTransactions` → `createTargetTransactions`
    - `usePendingPayments` → `createPendingPayments`
    - `useTransactions` → `createTransactions`
    - `useWoTScore` → `createWoTScore`
    - `useWoTDistance` → `createWoTDistance`
    - `useIsInWoT` → `createIsInWoT`
    - `useZapInfo` → `createZapInfo`
    - `useBlossomUpload` → `createBlossomUpload`
    - `useBlossomUrl` → `createBlossomUrl`

    Migration: Replace all `use*` function calls with their `create*` equivalents in your Svelte components.

### Minor Changes

- d4da836: Add meta-subscription support with $metaSubscribe

    Introduces `ndk.$metaSubscribe()`, a reactive subscription that returns events pointed to by e-tags and a-tags, rather than the matching events themselves. Perfect for:
    - Showing reposted content (kind 6/16)
    - Finding articles commented on (kind 1111)
    - Displaying zapped notes (kind 9735)
    - Any use case where you want to follow event references

    Supports multiple sort options:
    - `time`: Sort by event creation time (newest first)
    - `count`: Sort by number of pointers (most pointed-to first)
    - `tag-time`: Sort by most recently tagged (newest pointer first)
    - `unique-authors`: Sort by number of unique authors pointing to it

    Example usage:

    ```typescript
    const feed = ndk.$metaSubscribe(() => ({
        filters: [{ kinds: [6, 16], authors: $follows }],
        sort: "tag-time",
    }));

    // Access pointed-to events
    feed.events;

    // Access pointer events by target
    feed.eventsTagging(event);
    ```

- b5bdb2c: Add meta-subscription support with $metaSubscribe

    Introduces `ndk.$metaSubscribe()`, a reactive subscription that returns events pointed to by e-tags and a-tags, rather than the matching events themselves. Perfect for:
    - Showing reposted content (kind 6/16)
    - Finding articles commented on (kind 1111)
    - Displaying zapped notes (kind 9735)
    - Any use case where you want to follow event references

    Supports multiple sort options:
    - `time`: Sort by event creation time (newest first)
    - `count`: Sort by number of pointers (most pointed-to first)
    - `tag-time`: Sort by most recently tagged (newest pointer first)
    - `unique-authors`: Sort by number of unique authors pointing to it

    Example usage:

    ```typescript
    const feed = ndk.$metaSubscribe(() => ({
        filters: [{ kinds: [6, 16], authors: $follows }],
        sort: "tag-time",
    }));

    // Access pointed-to events
    feed.events;

    // Access pointer events by target
    feed.eventsTagging(event);
    ```

- b5bdb2c: Add reactive zap subscription system

    Comprehensive zap support for Svelte with reactive subscriptions and utilities:

    **$zaps() subscription method:**
    - Reactive zap subscriptions on events or users
    - Support for both NIP-57 (lightning) and NIP-61 (nutzaps)
    - Validation for both zap types
    - Filter by zap method
    - Aggregate metrics (count, total amount)
    - Support for validated-only zaps

    **ReactiveFollows class:**
    - Reactive wrapper around follow set
    - Network-aware add/remove operations

    **Utility functions:**
    - Extract zap amount, sender, and comments
    - Type-safe zap validation and parsing

    Example usage:

    ```typescript
    const zapSub = ndk.$zaps(() => ({
        target: event,
        validatedOnly: true,
    }));

    // Access zap metrics
    zapSub.totalAmount;
    zapSub.count;
    zapSub.events;
    ```

### Patch Changes

- b5bdb2c: Add event throttling to prevent excessive UI updates

    Implemented throttling mechanism for reactive event subscriptions to prevent excessive UI updates when many events arrive in quick succession. This improves performance and reduces unnecessary re-renders in Svelte applications.

- 46b1c0f: Simplify zap function to use ndk.wallet and ndk.$currentPubkey

    Refactored the zap function to access wallet directly from ndk.wallet instead of ndk.$wallet.wallet, and use ndk.$currentPubkey instead of requiring an active session. This simplifies the code and makes it more robust.

- Updated dependencies [b8e7a06]
- Updated dependencies [79503f5]
- Updated dependencies [ad7936b]
- Updated dependencies [b5bdb2c]
- Updated dependencies [4b8d146]
- Updated dependencies [8f116fa]
- Updated dependencies [b5bdb2c]
- Updated dependencies [72fc3b0]
- Updated dependencies [73adeb9]
- Updated dependencies [b5bdb2c]
- Updated dependencies [b5bdb2c]
    - @nostr-dev-kit/ndk@3.0.0
    - @nostr-dev-kit/cache-sqlite-wasm@1.0.0
    - @nostr-dev-kit/sync@0.4.0
    - @nostr-dev-kit/sessions@0.6.4
    - @nostr-dev-kit/wallet@0.8.11
    - @nostr-dev-kit/wot@0.3.7

## 3.0.0

### Patch Changes

- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.18.0
    - @nostr-dev-kit/wallet@0.8.10
    - @nostr-dev-kit/sync@0.3.6

## 2.4.4

### Patch Changes

- 4482b62: Fix wallet store API: `mints` now returns `string[]` of configured mint URLs (not filtered by balance), and add `mintBalances` getter that returns all mints with their balances including configured mints with 0 balance
- Updated dependencies
- Updated dependencies [6c5f645]
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.11
    - @nostr-dev-kit/sessions@0.6.3

## 2.4.3

### Patch Changes

- bump

## 2.4.2

### Patch Changes

- e2154a0: Add `publishMintList()` method to NDKCashuWallet for simplified CashuMintList (kind 10019) publishing. The svelte wallet store's `save()` method now automatically publishes both the wallet configuration (kind 17375) and the mint list (kind 10019) for nutzap reception, eliminating the need for manual mint list creation.
- Updated dependencies [e2154a0]
    - @nostr-dev-kit/wallet@0.8.9

## 2.4.1

### Patch Changes

- e864ddd: Fix Avatar component creating duplicate subscriptions when user changes

## 2.4.0

### Minor Changes

- feat(svelte): add shorthand filter syntax for $subscribe

    **New Feature:**
    - `$subscribe` now accepts filters directly without requiring a `filters` wrapper for cleaner, more concise code
    - Shorthand examples:
        - Single filter: `ndk.$subscribe(() => ({ kinds: [1], limit: 50 }))`
        - Array of filters: `ndk.$subscribe(() => [{ kinds: [1] }, { kinds: [3] }])`
    - The full config syntax with `filters` property still works when you need additional options like `relayUrls`, `wot`, etc.
    - Filter objects are automatically detected by checking for common filter properties (kinds, authors, ids, since, until, limit, etc.)
    - Updated documentation with examples showing both shorthand and full config syntax
    - Added test coverage for shorthand syntax

### Patch Changes

- fix(svelte): add runtime validation for callback parameters in reactive methods
    - All reactive methods now validate that parameters are functions and throw descriptive TypeErrors when non-functions are passed
    - Affected methods: `$subscribe`, `$fetchUser`, `$fetchProfile`, `$fetchEvent`, `$fetchEvents`, and `useZapInfo`
    - Error messages include the function name, parameter name, and usage examples
    - Added comprehensive test coverage for validation logic
    - Prevents confusing Svelte runtime errors when developers accidentally pass values directly instead of callbacks

    **Example error message:**

    ```
    TypeError: $subscribe expects config to be a function, but received object.
    Example: ndk.$subscribe(() => value) instead of ndk.$subscribe(value)
    ```

## 2.3.2

### Patch Changes

- fix(svelte): add runtime validation for callback parameters in reactive methods
    - All reactive methods now validate that parameters are functions and throw descriptive TypeErrors when non-functions are passed
    - Affected methods: `$subscribe`, `$fetchUser`, `$fetchProfile`, `$fetchEvent`, `$fetchEvents`, and `useZapInfo`
    - Error messages include the function name, parameter name, and usage examples
    - Added comprehensive test coverage for validation logic
    - Prevents confusing Svelte runtime errors when developers accidentally pass values directly instead of callbacks

- feat(svelte): add automatic event wrapping and generic typing to $fetchEvent and $fetchEvents

    **Breaking Change in Default Behavior:**
    - $fetchEvent and $fetchEvents now automatically use `wrap: true` by default to wrap events in their kind-specific classes (e.g., NDKArticle for kind 30023)
    - Invalid events that fail wrapper validation are silently dropped (return undefined), protecting apps from malformed data
    - To disable wrapping, pass `{ wrap: false }` as the second argument

    **New Features:**
    - Added generic type parameter support: `ndk.$fetchEvent<NDKArticle>(() => naddr)` and `ndk.$fetchEvents<NDKArticle>(() => filters)`
    - Added optional `FetchEventOptions` parameter to both methods to control wrapping behavior
    - Examples:
        - `ndk.$fetchEvent(() => eventId)` - automatically wrapped (default)
        - `ndk.$fetchEvent(() => eventId, { wrap: false })` - no wrapping
        - `ndk.$fetchEvent<NDKArticle>(() => naddr)` - typed and wrapped

    **Documentation & Tests:**
    - Updated documentation with examples showing typed usage and options
    - Added tests for automatic wrapping functionality
    - Added tests for wrap override options

## 2.3.1

### Patch Changes

- minor bugfix on Avatar component
- Simplify wallet API: replace `setupWallet()` and `updateWallet()` with single `save()` method. The new `save()` method automatically creates a new wallet if none exists, or updates the existing one. This provides a clearer, simpler API for managing wallet configuration.

    **Migration:**

    ```typescript
    // Before
    await ndk.$wallet.setupWallet({ mints, relays });
    await ndk.$wallet.updateWallet({ mints, relays });

    // After
    await ndk.$wallet.save({ mints, relays });
    ```

- Fix wallet being cleared during session transitions. Previously, when switching between sessions (e.g., logging in with a different account), the wallet would be incorrectly cleared because the new session's wallet event hadn't loaded yet. The fix tracks the current session's pubkey and only clears the wallet when staying on the same session, not during session transitions.
- Updated dependencies
- Updated dependencies [eb8d400]
    - @nostr-dev-kit/sessions@0.6.2
    - @nostr-dev-kit/ndk@2.17.10

## 2.3.0

### Minor Changes

- 1307288: Add reactive event fetching methods with consistent ergonomics:

    **$fetchEvent()**:
    - Reactively fetch a single event by bech32 ID (note1..., nevent1...) or filter
    - Returns reactive proxy to NDKEvent that updates when identifier/filter changes
    - Supports conditional fetching by returning undefined
    - Automatic cleanup and refetching

    **$fetchEvents()**:
    - Reactively fetch multiple events by single or multiple filters
    - Returns reactive array of NDKEvent[] that updates when filters change
    - Supports conditional fetching by returning undefined
    - Automatic cleanup and refetching

    Both methods follow the same callback-based API as $subscribe, $fetchUser, and $fetchProfile for consistent developer experience.

### Patch Changes

- Updated dependencies [bcef3e7]
- Updated dependencies [1307288]
    - @nostr-dev-kit/ndk@2.17.10
    - @nostr-dev-kit/cache-sqlite-wasm@0.8.2

## 2.2.6

### Patch Changes

- add LRU cache on fetchProfile
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.9

## 2.2.5

### Patch Changes

- add NutzapMonitor import
- Updated dependencies
    - @nostr-dev-kit/wallet@0.8.7

## 2.2.4

### Patch Changes

- add nutzap monitor
- Updated dependencies
    - @nostr-dev-kit/wallet@0.8.6

## 2.2.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.8

## 2.2.2

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.7

## 2.2.1

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/wallet@0.8.5

## 2.2.0

### Minor Changes

- Add `$wallet` store that manages Cashu wallet setup, configuration and balance tracking through NDK events. Includes reactive properties for active wallet, mints, relays, proofs, and unit balances with automatic WebLN support.

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/wallet@0.8.4
    - @nostr-dev-kit/ndk@2.17.6

## 2.1.12

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/wallet@0.8.3

## 2.1.11

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.5
    - @nostr-dev-kit/wallet@0.8.2

## 2.1.10

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.4

## 2.1.9

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/wallet@0.8.1

## 2.1.8

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/wallet@0.8.0

## 2.1.7

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.3

## 2.1.6

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.2

## 2.1.5

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.1

## 2.1.4

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.0

## 2.1.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.16.3

## 2.1.2

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.16.2

## 2.1.1

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.16.1

## 2.1.0

### Minor Changes

- Add cashu wallet

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/wallet@0.7.0
    - @nostr-dev-kit/ndk@2.16.0

## 2.0.4

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.15.3

## 2.0.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.15.2

## 2.0.2

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.15.1

## 2.0.1

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.15.0

## 2.0.0

### Major Changes

- Upgrade to Svelte 5

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.0

## 1.1.0

### Minor Changes

- add $ndk reactive functions
