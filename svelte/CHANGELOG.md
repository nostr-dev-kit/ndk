# Changelog

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
