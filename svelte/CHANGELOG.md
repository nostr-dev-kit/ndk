# Changelog

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
    - All reactive `# Changelog methods now validate that parameters are functions and throw descriptive TypeErrors when non-functions are passed
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
    - All reactive `# Changelog methods now validate that parameters are functions and throw descriptive TypeErrors when non-functions are passed
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
- Updated dependencies
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

## 2.2.0

### Minor Changes

- 76c4685: Add Name component for displaying user names from Nostr profiles with customizable field selection

### Patch Changes

- bcef3e7: Add LRU cache with 1000 entries for $fetchProfile to improve performance and reduce redundant network requests
- d5b4753: Wallet configuration and management improvements:

    **NDKCashuWallet**:
    - Add `send()` method to create cashu tokens for sending amounts
    - Add `update()` method to update wallet configuration (mints and relays) with proper replaceable event publishing
    - Add static `create()` factory method for easy wallet creation with initial configuration

    **ReactiveWalletStore (Svelte)**:
    - Add reactive Svelte 5 store for wallet state management
    - Automatic session integration with NDKSessionManager
    - Reactive balance, status, and wallet state using $state runes
    - Convenience methods and getters for mints, relays, and transactions

- Updated dependencies [59a97a5]
- Updated dependencies [28ebbe1]
- Updated dependencies [d5b4753]
    - @nostr-dev-kit/ndk@2.17.9
    - @nostr-dev-kit/cache-sqlite-wasm@0.8.2
    - @nostr-dev-kit/wallet@0.8.7

## 2.1.0

### Minor Changes

- Updated dependencies [ad1a3ee]
- Updated dependencies [a56276b]
- Updated dependencies [ed3110a]
- Updated dependencies [9b67ee6]
- Updated dependencies [66db51d]
    - @nostr-dev-kit/ndk@2.17.7
    - @nostr-dev-kit/sync@0.3.5

## 2.0.12

### Patch Changes

- a6722f6: Fix activeUser synchronization when sessions are restored from storage

    The session manager now explicitly sets `ndk.activeUser` when switching sessions, ensuring that the `activeUser:change` event fires immediately. This fixes an issue where `ndk.$currentUser` would be null even though sessions were properly restored from localStorage.

    **Breaking Change**: `switchTo()` is now async and returns a Promise. Update your code to await it:

    ```typescript
    // Before
    manager.switchTo(pubkey);

    // After
    await manager.switchTo(pubkey);
    ```

- Updated dependencies [a6722f6]
    - @nostr-dev-kit/sessions@0.6.1

## 2.0.11

### Patch Changes

- Updated dependencies [28881de]
    - @nostr-dev-kit/sessions@0.6.0

## 2.0.10

### Patch Changes

- Add convenient reactive getters for current user and session state
    - Add `$activeUser` getter as an alias for `$currentUser`
    - Add `$currentPubkey` getter to directly access the active user's pubkey
    - Add `$currentSession` getter to directly access the active session

    These getters simplify common patterns like:
    - Before: `const currentSession = $derived(ndk.$sessions?.current);`
    - After: `const currentSession = ndk.$currentSession;`

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.6
    - @nostr-dev-kit/sessions@0.5.0
    - @nostr-dev-kit/cache-sqlite-wasm@0.8.1

## 2.0.9

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.5
    - @nostr-dev-kit/cache-sqlite-wasm@0.8.0

## 2.0.8

### Patch Changes

- bump
- Updated dependencies
    - @nostr-dev-kit/ndk@2.17.4

## 2.0.7

### Patch Changes

- bump

## 2.0.6

### Patch Changes

- Update @nostr-dev-kit/ndk dependency to ^2.17.3
- Updated dependencies
    - @nostr-dev-kit/sessions@0.4.1
    - @nostr-dev-kit/sync@0.3.4
    - @nostr-dev-kit/wot@0.3.6

## 2.0.5

### Patch Changes

- bump
- Updated dependencies
    - @nostr-dev-kit/sync@0.3.3
    - @nostr-dev-kit/wot@0.3.5

## 2.0.4

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/sessions@0.4.0

## 2.0.3

### Patch Changes

- bump
- Updated dependencies
    - @nostr-dev-kit/sessions@0.3.2
    - @nostr-dev-kit/sync@0.3.2
    - @nostr-dev-kit/wallet@0.8.3
    - @nostr-dev-kit/wot@0.3.4

## 3.0.0

### Minor Changes

- 8315d5e: Add activeUser:change event to NDK and $currentUser() reactive accessor to NDKSvelte
    - NDK now emits an `activeUser:change` event whenever the active user changes (via signer, direct assignment, or read-only sessions)
    - NDKSvelte adds a `$currentUser()` method that returns a reactive value tracking the active user
    - This properly handles all scenarios including read-only sessions without signers
    - Fixes race condition where signer:ready event fired before activeUser was set

- d9d5662: Refactor AI guardrails to be extensible and clean
    - Remove inline guardrail checks from core business logic (88+ lines reduced to simple announcements)
    - Create organized guardrail modules with individual check functions
    - Add registration system for external packages to provide their own guardrails
    - Business logic now cleanly announces actions without embedding validation
    - NDKSvelte warns when instantiated without session parameter

- 691ba4d: Refactor EventContent component with extensible architecture and new editor
    - Complete refactor of EventContent component for better modularity and customization
    - Add customizable component registry for mentions, events, hashtags, links, media, and emojis
    - Add extensible handlers system for click events and interactions via EventContentHandlersProxy
    - Split parsing logic into reusable utilities (event-content-utils.ts)
    - Add new embedded event components (EmbeddedEvent, MentionPreview, HashtagPreview)
    - Add NostrEditor component with TipTap integration for rich text editing
    - Add editor node views for nprofile, nevent, naddr, images, and videos
    - Export new components and utilities for full customization

- 691ba4d: Enhance ReactiveWalletStore with comprehensive API and reactive state
    - Add reactive mints, relays, and transactions getters
    - Add balance getter for total wallet balance
    - Add send, receive, redeem, zapInvoice, and deposit methods
    - Export Mint and Transaction types from wallet store
    - Improve wallet initialization and lifecycle management
    - Add comprehensive documentation for wallet API

### Patch Changes

- 691ba4d: Fix ReactivePoolStore to initialize with existing relay connections
    - Initialize pool store with existing relay statuses on creation
    - Properly reflect connected relays that were established before store initialization

- Updated dependencies [8315d5e]
- Updated dependencies [d9d5662]
- Updated dependencies [6fb3a7f]
- Updated dependencies [028367b]
    - @nostr-dev-kit/ndk@2.18.0

## 2.0.2

### Patch Changes

- Enhanced EventContent component with inline avatars and granular entity callbacks
    - Added small avatar display next to user mentions (npub/nprofile)
    - Component can now accept an NDKEvent directly via `event` prop, automatically extracting content and emoji tags
    - Replaced generic onEventClick with specific callbacks:
        - onNoteClick for note1 references (receives eventId)
        - onNeventClick for nevent1 references (receives full EventPointer)
        - onNaddrClick for naddr1 references (receives full AddressPointer)
    - Apps now have complete control over entity click handling
    - Added comprehensive JSDoc documentation with examples

## 2.0.1

### Patch Changes

- bump
- Updated dependencies
    - @nostr-dev-kit/sessions@0.3.1
    - @nostr-dev-kit/ndk@2.17.1
    - @nostr-dev-kit/sync@0.3.1
    - @nostr-dev-kit/wot@0.3.3

## 2.0.0

### Patch Changes

- 344c313: Fix zap error handling and add method to query recipient payment methods
    - Fixed NDKZapper.zap() to properly throw errors when all payment attempts fail
    - Added getRecipientZapMethods() to query what payment methods recipients accept
    - Enhanced svelte zap function to log partial failures
    - Updated zap documentation with error handling and method querying examples

- Updated dependencies [344c313]
- Updated dependencies [344c313]
- Updated dependencies [2adef59]
- Updated dependencies [344c313]
- Updated dependencies [3407126]
- Updated dependencies [344c313]
    - @nostr-dev-kit/sessions@0.3.0
    - @nostr-dev-kit/ndk@2.17.0
    - @nostr-dev-kit/cache-sqlite-wasm@0.7.0
    - @nostr-dev-kit/sync@0.3.0
    - @nostr-dev-kit/wot@0.3.2
    - @nostr-dev-kit/wallet@0.8.2

## 1.0.1

### Patch Changes

- remove useUser and useProfile

## 1.0.0

### Patch Changes

- e596023: Fix wallet balance refresh when balance update is called without a balance parameter
- Updated dependencies [e596023]
    - @nostr-dev-kit/ndk@2.16.0

## 0.2.0

### Minor Changes

- b035fa3: Add read-only session support to ReactiveSessionsStore

    Updated the Svelte 5 sessions store to support read-only sessions:
    - `login()` and `add()` methods now accept both NDKSigner and NDKUser
    - Added `isReadOnly(pubkey?)` method to check if a session has signer access
    - Sessions created with just an NDKUser are automatically read-only

### Patch Changes

- Updated dependencies [a912a2c]
- Updated dependencies [4b71e74]
- Updated dependencies [446b753]
    - @nostr-dev-kit/ndk@2.15.3
    - @nostr-dev-kit/sessions@0.2.0
    - @nostr-dev-kit/wot@0.3.0

## 3.0.1

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/sessions@0.2.0

## 3.0.0

### Minor Changes

- 73c6a2f: Wire up automatic Cashu mint caching in wallet store. When a cache adapter is available, mint metadata and keysets are automatically cached during wallet initialization, completely transparent to app developers.

### Patch Changes

- Updated dependencies [73c6a2f]
- Updated dependencies [fad1f3d]
    - @nostr-dev-kit/ndk@2.17.0

## 2.0.0

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.16.0

## 1.4.1

### Patch Changes

- fix: properly implement WoT auto-reload without hacks

    **The Problem:**
    The original fix for the effect_orphan error introduced a hacky workaround that silently ignored the `autoReload` parameter, creating unnecessary technical debt and API confusion.

    **The Root Cause:**
    WoT store was designed as a singleton that "reloaded" when sessions changed. This was fundamentally wrong because:
    1. WoT is per-user (tied to a specific pubkey)
    2. Each session needs its own WoT instance
    3. Using `$effect` to watch session changes was a hack to work around bad architecture

    **The Proper Fix:**
    1. **Session-scoped WoT**: Changed WoT from singleton to a map of `pubkey -> NDKWoT`. Each session gets its own WoT instance.
    2. **Reactive derivation**: Use `$derived` to automatically switch to the current session's WoT - pure reactivity, no effects needed.
    3. **Observer pattern for auto-reload**: Added `sessions.onSessionChange()` callback system that works outside component context - plain JavaScript, no Svelte primitives.

    **Technical Changes:**
    - `WoTStore` now maintains `Map<pubkey, NDKWoT>` instead of single instance
    - Current WoT is derived from current session using `$derived`
    - `SessionStore` has callback system for session changes
    - Auto-reload works correctly at module scope via callbacks
    - Removed all `$effect` usage from stores
    - Removed hacky parameter stripping from `initStores`

    **Result:**
    - No more silently ignored parameters
    - `createNDK({ wot: { autoReload: true } })` works as expected
    - Cleaner architecture: WoT per session, not global singleton
    - No hacks, no workarounds, no technical debt

- fix: validate root pubkey in NDKWoT constructor

    Added validation to ensure the root pubkey passed to NDKWoT constructor is a valid 64-character hex string. This prevents invalid pubkeys from being used in filter authors arrays, which would cause errors when building the WoT graph at depth > 0.

    The validation happens in the constructor and throws an error with a clear message if an invalid pubkey is provided. This catches issues early rather than failing deep in the fetchEvents call.

- Updated dependencies
    - @nostr-dev-kit/wot@0.2.1

## 1.4.0

### Minor Changes

- feat: add createNDK() for simplified initialization

    Replaces verbose initialization boilerplate with a single function call:

    **Before:**

    ```typescript
    const ndk = new NDK({
        explicitRelayUrls: ["wss://relay.damus.io"],
    });

    initStores(ndk).then(() => {
        ndk.connect();
    });
    ```

    **After:**

    ```typescript
    const ndk = createNDK();
    ```

    The new `createNDK()` automatically:
    - Creates the NDK instance
    - Connects to relays (sensible defaults)
    - Initializes all stores
    - Restores sessions from localStorage

### Patch Changes

- fix: resolve effect_orphan error in createNDK()

    Fixed critical bug where createNDK() would throw `effect_orphan` error when called at component scope. The issue was caused by WoTStore.init() attempting to set up $effect outside of component initialization context.

    **Changes:**
    - Modified WoTStore to use lazy effect initialization
    - Updated initStores() to skip autoReload during initial WoT load
    - Added documentation clarifying that autoReload must be enabled manually from component context

    **Breaking Change (Minor):**
    - `autoReload` option in `createNDK({ wot: { autoReload: true } })` is now ignored
    - Users must explicitly call `wot.enableAutoReload()` from `onMount()` or component context

    **Migration:**

    ```typescript
    // Before (would error)
    const ndk = createNDK({
        wot: { depth: 2, autoReload: true },
    });

    // After (works correctly)
    import { onMount } from "svelte";
    import { wot } from "@nostr-dev-kit/svelte";

    const ndk = createNDK({
        wot: { depth: 2 },
    });

    onMount(() => {
        wot.enableAutoReload();
    });
    ```

## 1.3.0

### Minor Changes

- feat: add createNDK() for simplified initialization

    Introduce `createNDK()` - a one-liner that eliminates initialization boilerplate:

    **Before:**

    ```typescript
    import NDK from "@nostr-dev-kit/ndk";
    import { initStores } from "@nostr-dev-kit/svelte";

    const ndk = new NDK({
        explicitRelayUrls: ["wss://relay.damus.io", "wss://nos.lol"],
    });

    initStores(ndk).then(() => {
        ndk.connect();
    });
    ```

    **After:**

    ```typescript
    import { createNDK } from "@nostr-dev-kit/svelte";

    const ndk = createNDK();
    ```

    Features:
    - Automatically creates NDK instance, connects to relays, and initializes all stores
    - Sensible defaults: common relays, auto-connect, localStorage session persistence
    - Fully configurable via options object
    - No breaking changes - old `initStores()` pattern still works
    - Supports custom relays, WoT auto-loading, session storage adapters, and all NDK options

    This dramatically improves developer experience by reducing boilerplate while maintaining full flexibility for advanced use cases.

### Patch Changes

- bump

## 1.2.0

### Minor Changes

- feat: add createNDK() for simplified initialization

    Introduce `createNDK()` - a one-liner that eliminates initialization boilerplate:

    **Before:**

    ```typescript
    import NDK from "@nostr-dev-kit/ndk";
    import { initStores } from "@nostr-dev-kit/svelte";

    const ndk = new NDK({
        explicitRelayUrls: ["wss://relay.damus.io", "wss://nos.lol"],
    });

    initStores(ndk).then(() => {
        ndk.connect();
    });
    ```

    **After:**

    ```typescript
    import { createNDK } from "@nostr-dev-kit/svelte";

    const ndk = createNDK();
    ```

    Features:
    - Automatically creates NDK instance, connects to relays, and initializes all stores
    - Sensible defaults: common relays, auto-connect, localStorage session persistence
    - Fully configurable via options object
    - No breaking changes - old `initStores()` pattern still works
    - Supports custom relays, WoT auto-loading, session storage adapters, and all NDK options

    This dramatically improves developer experience by reducing boilerplate while maintaining full flexibility for advanced use cases.

## 1.1.0

### Minor Changes

- Add Web of Trust (WoT) support to svelte

    Features:
    - Global `wot` store with reactive WoT graph
    - Automatic WoT filtering for all subscriptions (opt-in)
    - Per-subscription WoT override options
    - WoT ranking support (distance, score, followers algorithms)
    - Reactive runes: `useWoTScore`, `useWoTDistance`, `useIsInWoT`
    - Session-aware auto-reload
    - Re-export filtering utilities from @nostr-dev-kit/wot

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/wot@0.2.0

## 1.0.2

### Patch Changes

- bump

## 1.0.1

### Patch Changes

- bump

## 1.0.0

### Patch Changes

- Integrate with ndk-core automatic mute filtering
    - Update `mutes` store to set `ndk.muteFilter` on initialization
    - Sync mutes store add/remove/clear operations with `ndk.mutedIds`
    - Update documentation to reflect automatic mute filtering
    - Remove deprecated `skipMuted` option references
    - Add `includeMuted` option documentation for moderation interfaces

    The mutes store now seamlessly integrates with NDK's core mute filtering, providing advanced keyword and hashtag filtering on top of the default pubkey/event ID filtering. All subscriptions automatically filter muted content unless explicitly opted in with `includeMuted: true`.

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.15.0

All notable changes to svelte will be documented in this file.

## [0.1.0] - 2025-10-01

### 🎉 Initial Beta Release

Core features implemented and tested. Ready for early adopters and testing.

### ✨ Features

#### Core Subscriptions

- **EventSubscription**: Reactive subscription class using Svelte 5 runes
    - Automatic cleanup when components unmount
    - Buffered updates (30ms → 16ms post-EOSE) for optimal performance
    - Smart deduplication using NDK's deduplication keys
    - Type-safe event conversion with `eventClass` option
    - Reference counting for shared subscriptions
    - Manual control methods: `start()`, `stop()`, `restart()`, `clear()`
    - Filter mutation: `changeFilters()`
    - Pagination: `fetchMore()`

#### Global Stores

**Profile Store**

- Automatic profile fetching and caching
- `get(pubkey)` - Fetch profile (cached)
- `fetch([pubkeys])` - Batch fetch
- `update(profile)` - Update current user profile

**Session Store**

- Multi-user session management
- `login(signer)` - Login with any NDK signer
- `add(signer)` - Add additional account
- `switch(pubkey)` - Switch between accounts
- `logout(pubkey)` - Logout specific account
- `logoutAll()` - Clear all sessions
- Session data: follows, mutes, relays, cached events
- Reactive accessors:
    - `follows` - Get current session's followed pubkeys
    - `mutes` - Get current session's muted pubkeys
    - `profile` - Get current session's profile
    - `getSessionEvent(kind)` - Retrieve events by kind

**Mute Store**

- Content filtering (NIP-51)
- `add({ pubkey | word | hashtag | eventId })` - Add mute
- `remove({ ... })` - Remove mute
- `check({ ... })` - Check if muted
- `publish()` - Publish mute list
- Automatic integration with subscriptions (`skipMuted: true`)

**Wallet Store**

- Multi-wallet support (Cashu, NWC, WebLN)
- Reactive balance tracking
- `set(wallet)` - Set active wallet
- `pay({ amount, recipient, comment })` - Send payment
- Transaction history (last 100 transactions)
- Nutzap monitoring:
    - `startNutzapMonitor()` - Monitor incoming nutzaps
    - Automatic redemption tracking
    - Pending/redeemed/failed state management

#### NDK Integration

- **NDKSvelte**: Extended NDK class
    - `subscribeReactive()` - Create reactive subscriptions
    - Automatic mute filter integration
    - `initStores()` - Initialize global stores

### 📦 Build & Distribution

- TypeScript compilation
- Vite bundling
- Tree-shakeable exports
- Bundle size: ~15.5 KB (gzipped: ~4.4 KB)

### ✅ Testing

- 119 tests passing
- Test coverage across all features:
    - EventSubscription (22 tests)
    - Profile store (7 tests)
    - Session store (19 tests)
    - Mute store (12 tests)
    - Wallet store (17 tests)
    - NDKSvelte (7 tests)

### 📚 Documentation

- Comprehensive README with API reference
- Example application (basic feed)
- TypeScript definitions
- Inline JSDoc comments

### 🚧 Known Limitations

- Component library not yet implemented
- Limited example applications
- Performance benchmarks pending
- Documentation site pending

### 🔄 Breaking Changes from ndk-svelte

- No backwards compatibility with ndk-svelte (Svelte 4)
- Different API: `subscribeReactive()` instead of `storeSubscribe()`
- Runes-based instead of store-based
- Svelte 5+ required

## [Unreleased]

### Planned Features

- Component library (UserAvatar, UserName, UserProfile)
- Additional wallet components
- Utility components (InfiniteScroll, VirtualList)
- More example applications
- Performance benchmarks
- Bundle size optimizations
- Documentation site

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
