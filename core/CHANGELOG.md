# @nostr-dev-kit/ndk

## 3.0.0

### Minor Changes

- 53768a2: Add NIP-A0 voice message support with NDKVoiceMessage (kind 1222) and NDKVoiceReply (kind 1244) event wrappers. Both classes include getters/setters for audio URL, waveform data, and duration from imeta tags.

## 3.0.0-beta.2

### Minor Changes

- Add NDKRelayFeedList wrapper for NIP-51 kind 10012 (Relay Feed List). This new class provides comprehensive support for managing user's favorite browsable relays and relay sets, with helper methods for adding/removing relay URLs and relay set references.

## 3.0.0

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

- b5bdb2c: Add NIP-69 P2P Order event support

    Added support for NIP-69 P2P Order events (kind 38383), enabling peer-to-peer marketplace functionality. This includes event class registration and proper handling of P2P order events.

- 72fc3b0: Subscription performance improvements and batch processing support
    - Added `onEvents` callback option for batch processing of cached events
    - Reduced default `groupableDelay` from 100ms to 10ms for faster subscription grouping
    - Optimized cache result processing with single-pass timestamp calculation
    - Added `onEventsHandler` parameter to `start()` method for direct batch handling
    - Improved performance by eliminating per-event overhead in batch mode

### Patch Changes

- b8e7a06: Remove single event ID lookup warning from AI guardrails

    Removed the overly strict warning that suggested using fetchEvent() for single ID lookups with fetchEvents(). This allows more flexibility when intentionally using fetchEvents() for single event queries.

- ad7936b: Fix race condition that caused empty REQ messages to be sent to relays when subscriptions were closed before their scheduled execution time
- b5bdb2c: Allow follow/unfollow to accept hex pubkeys directly

    Enhanced follow and unfollow methods to accept hex pubkeys in addition to NDKUser objects, making the API more flexible and convenient when working with raw pubkeys.

- 4b8d146: Add futureTimestampGrace option to protect against events with far-future timestamps

    Added a new `futureTimestampGrace` optional parameter to the NDK constructor that allows filtering out events with timestamps too far in the future. When set, subscriptions will automatically discard events where `created_at` is more than the specified number of seconds ahead of the current time. This helps protect against malicious relays sending events with manipulated timestamps. Defaults to `undefined` (no filtering) for backward compatibility.

- 8f116fa: Change NIP-46 default encryption from NIP-04 to NIP-44. NIP-44 is the newer, more secure encryption standard and is now used by default in modern bunker implementations. The RPC layer automatically falls back to NIP-04 when needed for compatibility.
- 73adeb9: Add wallet getter to NDK class

    Added a proper getter for the wallet property on the NDK class, allowing retrieval of the configured wallet instance. Previously only the setter was available.

## 2.18.0

### Minor Changes

- Allow follow/unfollow methods to accept hex pubkeys directly

    The `follow` and `unfollow` methods now accept both `NDKUser` objects and hex pubkey strings for both the target user and the `currentFollowList` parameter. This provides more flexibility when working with follow lists, allowing direct use of pubkey strings without needing to wrap them in NDKUser objects.

## 2.17.11

### Patch Changes

- Allow follow/unfollow methods to accept hex pubkeys directly

    The `follow` and `unfollow` methods now accept both `NDKUser` objects and hex pubkey strings for both the target user and the `currentFollowList` parameter. This provides more flexibility when working with follow lists, allowing direct use of pubkey strings without needing to wrap them in NDKUser objects.

- Add getter for ndk.wallet to return wallet instance

    Previously, `ndk.wallet` was write-only (setter without getter), causing it to always return `undefined` when accessed. Now stores and returns the actual wallet instance while maintaining backward compatibility with `ndk.walletConfig` for zapping functionality.

## 2.17.10

### Patch Changes

- eb8d400: Add AI guardrail for replaceable events with old timestamps. Warns when calling `publish()` on a replaceable event (kind 0, 3, 10k-20k, 30k-40k) with a `created_at` older than 10 seconds, guiding developers to use `publishReplaceable()` instead to ensure proper event replacement on relays.

## 2.17.9

### Patch Changes

- 59a97a5: Ensure async cache adapters are fully initialized before NDK operations. Cache initialization now happens during `connect()` alongside relay connections, and subscriptions wait for cache readiness before starting.

    SQLite WASM cache improvements:
    - Add initialization guards to all cache functions to prevent race conditions
    - Implement proper database migration versioning system (v2)
    - Support multi-field profile search (search across name, displayName, nip05 simultaneously)
    - Remove verbose migration logging (keep only errors)
    - Bump version to 0.8.1

- 28ebbe1: Fix NIP-17 gift-wrapped message decryption caching. Previously, decrypted events were being repeatedly decrypted because the cache key (wrapper ID) didn't match the stored key (rumor ID). Now properly caches decrypted gift-wrapped messages using the wrapper event ID as the cache key, eliminating redundant decryption operations.

    Adds comprehensive tests to verify cache behavior with gift-wrapped events.

## 2.17.8

### Patch Changes

- Cache decrypted NIP-17 events to avoid redundant decryption. The `giftUnwrap` function now checks the cache adapter for previously decrypted events and stores newly decrypted events, significantly improving performance when handling NIP-17 gift-wrapped messages.

## 2.17.7

### Patch Changes

- ed3110a: Improve NIP-17 gift wrapping developer experience
    - Auto-set rumor.pubkey in giftWrap() if not present - eliminates common "can't serialize event" errors
    - Add AI guardrails with JSDoc warnings for common NIP-17 mistakes (signing rumors, using wrong timestamps, forgetting to publish to sender relays)
    - Add runtime warning when rumor is already signed
    - Improve documentation in gift-wrapping.ts with clear guidance on NIP-17 best practices

- ad1a3ee: Improve AI guardrails with ratio-based fetchEvents warnings

    AI guardrails now track the ratio of fetchEvents to subscribe calls and only warn when fetchEvents usage exceeds 50% AND total calls exceed 6. This prevents false positives for legitimate fetchEvents usage patterns while still catching code that overuses fetchEvents when subscribe would be more appropriate.

    The guardrails now:
    - Track both fetchEvents and subscribe call counts
    - Only warn when the ratio indicates a pattern of misuse (>50% fetchEvents with >6 total calls)
    - Allow legitimate single/few fetchEvents calls without warnings
    - Provide more accurate guidance for subscription-based architectures

- a56276b: Fix subscription ID length exceeding relay limits

    When multiple subscriptions with custom subId values were grouped together, NDK could generate subscription IDs exceeding 64+ characters, causing relays to reject them with "ERROR: bad req: subscription id too long".

    Changes:
    - Truncate individual subId parts to 10 characters maximum
    - Limit combined subscription ID to 20 characters before adding random suffix
    - Reduce length check threshold from 48 to 25 characters
    - Final subscription IDs are now guaranteed to be ≤ 26 characters

- 9b67ee6: Replace nostr-tools dependency with native NIP-57 zap request implementation

    Removed dependency on nostr-tools' `makeZapRequest` function and implemented native NIP-57 compliant zap request generation. This provides better control over the implementation and adds support for the optional `k` tag (event kind) in zap requests for improved compatibility with modern nostr implementations.

    Changes:
    - Native implementation of kind 9734 zap request generation
    - Added `k` tag support for event zaps (per NIP-57 specification)
    - Comprehensive test coverage for all zap request scenarios
    - No breaking changes to the public API

## 2.17.6

### Patch Changes

- Improve event serialization error messages to show which specific properties are invalid or missing, including their expected types and actual values. This makes debugging serialization failures much easier by providing detailed context instead of the generic "can't serialize event with wrong or missing properties" error.
- Add protocol versioning and validation to prevent worker message format mismatches

    **Problem:** Apps using NDK with SQLite WASM cache could crash with "object is not iterable" errors when stale or mismatched worker files were deployed. The signature verification handler would receive messages from the cache worker (or vice versa) and fail to parse them.

    **Solution:**
    1. **Message Format Validation**: The signature verification handler now validates incoming messages and logs clear, actionable errors when it receives incompatible formats, guiding developers to update their worker files.
    2. **Protocol Versioning**: Both workers now include protocol metadata in their messages:
        - Signature worker: Uses protocol name `ndk-sig-verify` with NDK version
        - Cache worker: Uses protocol name `ndk-cache-sqlite` with cache-sqlite-wasm version
    3. **Version Checking**: Message handlers detect and warn about version mismatches between library code and deployed worker files, helping developers identify when worker files need to be updated.

    **Benefits:**
    - No more silent failures or cryptic errors
    - Clear guidance when worker files are stale or misconfigured
    - Easier debugging of worker-related issues
    - Future-proof protocol evolution

    **Migration:** No breaking changes. Existing apps will see helpful error messages if they have worker mismatches, guiding them to fix the issue.

## 2.17.5

### Patch Changes

- Retry event publishing after successful authentication when relay returns auth-required

    When a relay responds to an event publish with `OK false "auth-required:"`, NDK now automatically:
    1. Holds the publish promise instead of immediately rejecting it
    2. Triggers the authentication flow via the relay's auth policy
    3. Retries the event publish after successful authentication
    4. Resolves or rejects the original publish promise based on the retry result

    If authentication fails, all pending publishes that were waiting for auth are rejected with an appropriate error message.

    Additionally, proper cleanup of pending publishes is now performed on relay disconnection to prevent memory leaks and ensure promises don't hang indefinitely.

    This ensures that publishing operations seamlessly handle authentication requirements without the caller needing to manually retry. The publish will only fail or succeed once the authentication flow completes.

- Improve error message when serializing invalid events

    When gift wrapping fails due to invalid event properties, the error message now clearly indicates which properties are missing or invalid instead of just saying "can't serialize event with wrong or missing properties". The error now includes:
    - Which specific properties are invalid
    - What type/format each property should be
    - The full event object for debugging

- Add exclusiveRelay option to enforce relay provenance in subscriptions

    Adds a new `exclusiveRelay` option to `NDKSubscriptionOptions` that restricts event delivery to only those from the specified relay set. When enabled:
    - Events from other relays are rejected even if they match the subscription filters
    - Optimistic publish events are only accepted if `skipOptimisticPublishEvent` is false
    - Cached events are accepted if they were previously seen on a relay in the subscription's relay set
    - Live events are only accepted if they come from a relay in the subscription's relay set

    This is useful for scenarios requiring strict relay provenance, such as:
    - Fetching events exclusively from a specific relay
    - Implementing relay-based isolation or routing
    - Testing relay-specific behavior

    Example:

    ```typescript
    // Only receive events from relay-a.com, ignore matches from other relays
    ndk.subscribe({ kinds: [1] }, { relayUrls: ["wss://relay-a.com"], exclusiveRelay: true });
    ```

- Add AI guardrails to prevent hashtag # prefix in tags and filters

    NDK now validates that hashtags do not include the # prefix in both event tags and subscription filters:

    **Event validation (at signing time):**
    - Checks all `t` tags to ensure values don't start with #
    - Throws fatal error with helpful message if # prefix is detected
    - Guides developers to use `['t', 'nostr']` instead of `['t', '#nostr']`

    **Filter validation (at subscription time):**
    - Checks all `#t` filter values to ensure they don't start with #
    - Throws fatal error with helpful message if # prefix is detected
    - Guides developers to use `{ "#t": ["nostr"] }` instead of `{ "#t": ["#nostr"] }`

    This prevents a common mistake where developers include the # symbol in hashtag values, which breaks proper hashtag indexing and querying on relays.

## 2.17.4

### Patch Changes

- Add exclusiveRelay option for relay-specific subscriptions

    Adds a new `exclusiveRelay` boolean option to `NDKSubscriptionOptions` that allows subscriptions to only accept events from their specified relaySet/relayUrls, ignoring cross-subscription matching from other relays.

    When `exclusiveRelay: true`:
    - Events are only delivered if they come from a relay in the subscription's relaySet
    - Cached events are checked against their known relay provenance
    - Optimistic publishes respect the skipOptimisticPublishEvent setting

    When `exclusiveRelay: false` (default):
    - Maintains current behavior with cross-subscription matching
    - Events matching the filter from any relay are delivered

    This is useful for scenarios requiring strict relay provenance, such as fetching events exclusively from a specific relay or implementing relay-based isolation.

## 2.17.3

### Patch Changes

- 8678b1f: Add AI guardrail to validate #a tag filters only use addressable event kinds (30000-39999)
- c901395: Remove param replaceable event d-tag warning from signing guardrails

## 2.17.2

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

### Patch Changes

- 6fb3a7f: test: add comprehensive event deduplication and onRelays tracking tests

    Adds test coverage for event deduplication behavior and onRelays accumulation. Tests verify that:
    - onRelays correctly accumulates relays as duplicate events arrive
    - event:dup is emitted with proper parameters (event, relay, timeSinceFirstSeen)
    - First event occurrence triggers 'event' while subsequent ones trigger 'event:dup'
    - The relay parameter in event:dup correctly identifies which relay sent the duplicate
    - Edge cases like rapid duplicates and events without relay info are handled correctly

- 028367b: feat(cache-redis): add support for tracking multiple relays per event

    The Redis cache adapter now properly tracks all relays an event has been seen from:
    - Stores relay information in a separate Redis Set (`relays:{eventId}`) to track provenance
    - Accumulates relays without duplicating entries using Redis Sets
    - Restores all relay information when querying cached events
    - Implements `setEventDup` method to handle relay tracking for duplicate events
    - Registers all relays with NDK's subscription manager for proper `onRelays` behavior
    - Fixes Redis connection status checks (now using 'ready' instead of 'connect')

    This ensures proper relay provenance tracking which is essential for outbox model support and understanding event distribution across the network.

## 2.17.1

### Patch Changes

- bump

## 2.17.0

### Minor Changes

- 344c313: Add comprehensive relay metadata and statistics caching system

    This release introduces a flexible relay metadata caching system that allows both core functionality and packages to store and retrieve relay-specific information persistently.

    **Core Features:**
    - **Expanded NDKCacheRelayInfo** type with connection tracking, NIP-11 caching, and extensible metadata
    - **NIP-11 automatic caching** in `relay.fetchInfo()` with 24-hour TTL
    - **Connection failure tracking** with fields for consecutive failures and backoff timing
    - **Package-specific metadata** with namespacing to avoid conflicts

    **Cache Adapter Updates:**
    All cache adapters now support metadata merging:
    - `cache-memory`: In-memory storage with proper metadata merging
    - `cache-dexie`: IndexedDB storage with schema v17
    - `cache-sqlite`: SQLite storage with updated schema
    - `cache-sqlite-wasm`: WASM SQLite with metadata support

    **Sync Package:**
    - Migrated from in-memory to persistent relay capability caching
    - Negentropy support detection now persists across restarts
    - Capability cache TTL of 1 hour

    **Benefits:**
    - Reduces unnecessary network requests (NIP-11 cached for 24 hours)
    - Enables smart connection backoff strategies
    - Allows packages to share relay metadata infrastructure
    - Persists across application restarts when using persistent cache adapters

    **Breaking Changes:**
    - `NDKSync.getRelayCapability()` is now async
    - `NDKSync.clearCapabilityCache()` is now async
    - cache-dexie schema bumped to v17 (auto-migrates)

    **Migration:**
    No action required for basic usage. If you're using `NDKSync.getRelayCapability()` or `clearCapabilityCache()`, add `await`:

    ```typescript
    // Before
    const capability = sync.getRelayCapability(url);

    // After
    const capability = await sync.getRelayCapability(url);
    ```

    See `core/docs/relay-metadata-caching.md` for full documentation and examples.

- 344c313: Fix zap error handling and add method to query recipient payment methods
    - Fixed NDKZapper.zap() to properly throw errors when all payment attempts fail
    - Added getRecipientZapMethods() to query what payment methods recipients accept
    - Enhanced svelte zap function to log partial failures
    - Updated zap documentation with error handling and method querying examples

## 2.16.1

### Patch Changes

- bump

## 2.16.0

### Minor Changes

- e596023: Add NIP-49 encrypted private key (ncryptsec) support and code formatting improvements
    - Add NIP-49 support for encrypted private keys with `fromNcryptsec` and `encryptToNcryptsec` methods
    - Re-export nip49 utilities from nostr-tools for direct access to encrypt/decrypt functions
    - Apply consistent code formatting across the codebase

## Unreleased

### Minor Changes

- Add NIP-49 encrypted private key (ncryptsec) support
    - New `NDKPrivateKeySigner.fromNcryptsec(ncryptsec, password, ndk?)` static method to create signers from encrypted private keys
    - New `signer.encryptToNcryptsec(password, logn?, ksb?)` method to encrypt private keys with a password
    - Re-exported `nip49` utilities from nostr-tools for direct access to `encrypt()` and `decrypt()` functions
    - Supports configurable security parameters (log_n for computational cost, key security byte)

    This enables secure storage of private keys with password protection, ideal for web applications that need to persist keys in localStorage or other client-side storage.

    ```typescript
    // Encrypt a private key
    const signer = NDKPrivateKeySigner.generate();
    const ncryptsec = signer.encryptToNcryptsec("my-password");
    localStorage.setItem("encrypted_key", ncryptsec);

    // Restore from encrypted key
    const restoredSigner = NDKPrivateKeySigner.fromNcryptsec(
        localStorage.getItem("encrypted_key"),
        "my-password",
    );
    ```

- Add NIP-11 relay information document support
    - New `NDKRelayInformation` interface with complete NIP-11 fields (metadata, limitations, fees, retention policies, etc.)
    - New `fetchRelayInformation(url)` function to fetch NIP-11 info from any relay URL
    - New `relay.fetchInfo()` method with automatic caching
    - New `relay.info` getter for cached relay information

    This enables applications to query relay capabilities, limitations, and metadata programmatically. Useful for checking supported NIPs, relay policies, fees, and restrictions before connecting or publishing.

    ```typescript
    // Via relay instance (with caching)
    const relay = ndk.pool.relays.get("wss://relay.damus.io");
    const info = await relay.fetchInfo();
    console.log(`Relay: ${info.name}`);
    console.log(`Supported NIPs: ${info.supported_nips}`);

    // Direct fetch
    import { fetchRelayInformation } from "@nostr-dev-kit/ndk";
    const info = await fetchRelayInformation("wss://relay.damus.io");
    ```

## 2.15.3

### Patch Changes

- a912a2c: Fix race condition in relay list fetching that prevented subscriptions from connecting to user relays

    The `getRelayListForUsers` function had a race condition where the timeout (1000ms) was firing before EOSE arrived from relays (~1300ms), causing it to resolve with an empty relay list. This prevented the `user:relay-list-updated` event from being emitted, which meant subscriptions would never connect to the user's relays.
    - Added `resolved` flag to prevent double-resolution of the promise
    - Implemented conditional timeout that extends by 3 seconds only when relays are disconnected or connecting
    - When relays are already connected, uses the normal timeout since EOSE should resolve it quickly
    - This ensures subscriptions created before relay connection are properly sent to relays when they come online

## 2.15.2

### Patch Changes

- b7e7f92: Register NIP-87 event kinds (NDKCashuMintAnnouncement, NDKFedimintMint, NDKMintRecommendation) in event wrapper and export from main index

## 2.15.1

### Patch Changes

- 73c6a2f: Add Cashu mint info and keyset caching support to cache adapter interface. New optional methods allow cache adapters to store and retrieve mint metadata and keysets, improving wallet performance by eliminating redundant network requests.
- fad1f3d: Add NIP-87 ecash mint announcement event kinds: NDKCashuMintAnnouncement (kind 38172), NDKFedimintMint (kind 38173), and NDKMintRecommendation (kind 38000) for mint discovery and user recommendations.
- Add NIP-87 event wrappers for ecash mint announcements and recommendations

    Adds support for NIP-87 (Cashu & Fedimint Mints) with three new event classes:
    - `NDKCashuMintAnnouncement` (kind 38172): Cashu mint announcements with URL, supported NUTs, and network metadata
    - `NDKFedimintMint` (kind 38173): Fedimint federation announcements with invite codes, modules, and network metadata
    - `NDKMintRecommendation` (kind 38000): Parameterized-replaceable events for recommending and reviewing ecash mints

    All classes include proper getters/setters for NIP-87 tags and are automatically wrapped by `wrapEvent()`.

## 2.15.0

### Minor Changes

- Implement dynamic subscription relay refresh for outbox model
    - Add `refreshRelayConnections` method to NDKSubscription for dynamic relay set updates
    - Implement outbox tracker event emission when relay lists are updated
    - Add NDK listener for outbox updates that refreshes affected subscriptions
    - Add relay hints support to outbox tracker from NDKUser objects
    - Add NIP-19 tutorial documentation and tests
    - Add outbox late arrival test for subscription edge cases

    This enables subscriptions to automatically discover and connect to new relays when user relay lists become available, improving outbox model efficiency and real-time subscription performance.

- Implement automatic mute filtering for subscriptions
    - Add `muteFilter` configurable function to NDK class for custom mute logic
    - Add `includeMuted` subscription option to control mute filtering behavior
    - Implement automatic mute filtering in `NDKSubscription.eventReceived()`
    - Default mute filter checks `ndk.mutedIds` for muted authors and events
    - Mute list (kind 10000) is automatically fetched when active user is set

    This enables applications to automatically filter out muted content by default, with the ability to opt-in to include muted events when needed (e.g., for moderation interfaces). The mute filter is configurable, allowing applications to implement custom mute logic beyond the default pubkey/event ID checking.

### Patch Changes

- Fix: prevent subscriptions with empty filters array
    - Add validation to prevent subscription creation with empty filters array
    - Improve subscription robustness and prevent potential relay errors
    - Add better error handling for invalid subscription parameters

    This fixes a potential issue where subscriptions could be created with empty filters, which could cause unexpected behavior or errors when communicating with relays.

## 2.14.38

### Patch Changes

- Prevent subscriptions with empty filters array

    Subscriptions now throw an error if created with an empty filters array, preventing undefined filter errors in queryFullyFilled and filterIncludesIds functions.

## 2.14.37

### Patch Changes

- 2886111: Add filter validation to prevent undefined values in subscription filters

    Prevents runtime errors in cache adapters (especially SQLite WASM) that cannot handle undefined values in parameterized queries.

    The NDK constructor now accepts a `filterValidationMode` option:
    - `"validate"` (default): Throws an error when filters contain undefined values
    - `"fix"`: Automatically removes undefined values from filters
    - `"ignore"`: Skip validation entirely (legacy behavior)

    This fixes the "Wrong API use: tried to bind a value of an unknown type (undefined)" error in sqlite-wasm cache adapter.

- 96341c3: Remove old NIP-60 migration code and legacy wallet kind 37375
    - Removed `getOldWallets` function and `migrateCashuWallet` from ndk-wallet
    - Removed `LegacyCashuWallet = 37375` kind definition from ndk-core
    - Cleaned up all references to the legacy migration code

## 2.14.36

### Patch Changes

- 8bd22bd: feat: add robust relay keepalive and reconnection handling

    Implement comprehensive relay connection monitoring and recovery:
    - Add keepalive mechanism to detect silent/stale relay connections
    - Monitor WebSocket readyState every 5 seconds to catch dead connections
    - Detect system sleep/wake events by monitoring time gaps
    - Smart reconnection backoff: aggressive after idle/sleep vs standard exponential
    - Track idle connections and reset backoff appropriately
    - Properly handle stale WebSocket connections with cleanup and reconnect
    - Add connection probing before assuming connections are dead

    This significantly improves NDK's resilience to network interruptions, system sleep/wake cycles, and silent relay failures.

## 2.14.35

### Patch Changes

- feat: add pTagOnATags and pTags options to ContentTaggingOptions

    Added two new options to ContentTaggingOptions for fine-grained control over p tag additions:
    - `pTagOnATags`: Controls whether p tags are added when creating a tags (for addressable events)
    - `pTags`: Disables all p tag additions when set to false

    These options provide more flexibility for applications that need to control how p tags are added to events, particularly useful for privacy-conscious applications or specific protocol implementations.

    The options are respected in:
    - Content tagging (npub, nprofile, nevent, naddr references)
    - Event replies (both NIP-01 and NIP-22 style)
    - Event tagging via the tag() method
    - Reference tag generation

## 2.14.34

### Patch Changes

- d89dbc6: Add ContentTaggingOptions for flexible content tagging control
    - Introduces ContentTaggingOptions interface to customize tag generation behavior
    - Adds options to control reply tag inclusion (includeReplyTags)
    - Adds configurable hashtag prefixes via hashtagPrefixes option
    - Maintains backward compatibility with existing tag method signatures
    - Includes comprehensive test coverage for new tagging options

- fff020a: feat: add robust relay keepalive and reconnection handling
    - Implement keepalive mechanism to detect silent relay disconnections
    - Add WebSocket state monitoring to detect dead connections
    - Implement sleep/wake detection for better reconnection after system suspend
    - Add idle-aware reconnection with aggressive backoff after wake events
    - Improve exponential backoff strategy with proper capping at 30s
    - Add comprehensive test coverage for all new functionality

## 2.14.33

### Patch Changes

- bump

## 2.14.32

### Patch Changes

- 9cb8407: Fix relay reconnection logic after long disconnections
    - Fixed exponential backoff calculation that was using XOR operator (^) instead of exponentiation
    - Added detection and cleanup of stale WebSocket connections after system sleep/resume
    - Improved connection state handling to prevent infinite reconnection loops

    The reconnection delay calculation was incorrectly using `(1000 * attempt) ^ 4` which performed a bitwise XOR operation resulting in delays of only 1-2 seconds. This has been corrected to use `Math.pow(1000 * (attempt + 1), 2)` for proper exponential backoff.

## 2.14.31

### Patch Changes

- add NDKThread event

## 2.14.30

### Patch Changes

- enhance NDKEvent with signed/unsigned type system and add related tests

## 2.14.29

### Patch Changes

- Allow users to register their own wrapers

## 2.14.28

### Patch Changes

- project picture functions

## 2.14.27

### Patch Changes

- wrap new kinds

## 2.14.26

### Patch Changes

- ndkproject title

## 2.14.25

### Patch Changes

- add TENEX and Stacks kinds

## 2.14.24

### Patch Changes

- add way to foce using nip-22 reply

## 2.14.23

### Patch Changes

- 7476407: add optional initialize functions to cache adapter interface

## 2.14.22

### Patch Changes

- correct pubkey

## 2.14.21

### Patch Changes

- decrypt from the right person

## 2.14.20

### Patch Changes

- p-tag counterparty

## 2.14.19

### Patch Changes

- Add Draft Proposal support

## 2.14.18

### Patch Changes

- bump

## 2.14.17

### Patch Changes

- bump

## 2.14.16

### Patch Changes

- export NDKFollowPack

## 2.14.15

### Patch Changes

- bump

## 2.14.14

### Patch Changes

- update NDKDraft save method to use publishReplaceable

## 2.14.13

### Patch Changes

- enhance NDKDraft event handling and integrate wrapEvent function

## 2.14.12

### Patch Changes

- bump

## 2.14.11

### Patch Changes

- bump

## 2.14.10

### Patch Changes

- bump

## 2.14.8

### Patch Changes

- draft checkpoints

## 2.14.7

### Patch Changes

- include README in build

## 2.14.6

### Patch Changes

- add NIP-46 nostrconnect:// support

## 2.14.5

### Patch Changes

- bump

## 2.14.4

### Patch Changes

- finally solve race conditions when publishing to relays in connecting state
- finally solve race conditions when publishing to relays in connecting state

## 2.14.3

### Patch Changes

- fix bug that causes ndk.connect() to return prematurely

## 2.14.2

### Patch Changes

- bump

## 2.14.1

### Patch Changes

- version bump

## 2.14.0

### Minor Changes

- 5ab19ef: feat: Refactor session management and add persistence
    - **ndk-core:** Added signer serialization (`toPayload`, `fromPayload`) and deserialization (`ndkSignerFromPayload`, `signerRegistry`) framework.
    - **ndk-hooks:** (Breaking Change) Refactored session state into `useNDKSessions` store with new management functions (`addSigner`, `startSession`, `switchToUser`, etc.), removing old session logic.
    - **ndk-mobile:** Added persistent session storage using `expo-secure-store` (`session-storage.ts`, `useSessionMonitor`, `bootNDK`). Updated `NDKNip55Signer` for serialization and registration.

### Patch Changes

- c83166a: bump
- 6e16e06: Implement caching for decrypted events in NDKCacheAdapter.
- import changes
- 5ab19ef: Adds new option addSinceFromCache to modify filters with a since for the last event that matches the filter that is in the cache. Use this to speed up relay list fetching

## 2.12.2

### Patch Changes

- bump

## 2.12.1

### Patch Changes

- 3ea9695: deprecate userProfile.image
- cca3357: move NDKWalletChange from ndk-wallet to NDKCashuWalletTx in ndk
- 1235f69: add test utils to package @nostr-dev-kit/ndk/test

## 2.12.0

### Minor Changes

- f255a07: Allow NDKSubscription leveraging synchronous query cache adapters.

### Patch Changes

- f255a07: avoid hitting the cache for ephemeral events
- 2171140: fix bug: correct checking encryption scheme when it's not set
- 72c8492: make it possible for cache adapters to return events synchronously
- 72c8492: add fetchEventSync to fetch events from the cache synchronously

## 2.11.2

### Patch Changes

- updates to nip-60
- improvements to nwc stability
- zapper interface changes

## 2.11.1

### Patch Changes

- avoids distributing events that were NIP-70ed

## 2.11.0

### Minor Changes

- 35987be: deprecate user.zap/ndk.zap -- use new NDKZapper instead
- Add support for NIP-22

### Patch Changes

- 689305c: move NWC to ndk-wallet
- 35987be: add pubkey hint to e tags
- 35987be: fix bug where both a and e tags were going in zap requests
- 4ed75a6: add NIP-22 support

## 2.10.7

### Patch Changes

- auto-auth to nip46 relays, and set the user pubkey after getting it from remote

## 2.10.6

### Patch Changes

- bump

## 2.10.5

### Patch Changes

- 5939a3e: fix: authed relays weren't reported as connected on connectedRelays
- fix (NDKRelayConnectivity) reconnection Issues
- f2a0cce: add netDebug direction

## 2.10.4

### Patch Changes

- 5bed70c: fix: authed relays weren't reported as connected on connectedRelays
- 873ad4a: concatenate subscriptions that use a limit -- this is better than treating subscriptions with a limit filter as non-groupable

## 2.10.3

### Patch Changes

- 0fc66c5: fix bugs with groupings, missing EOSEs and missing events under some conditions

## 2.10.2

### Patch Changes

- NIP-46 bunker URI improvements

## 2.10.1

### Patch Changes

- d6cfa8a: cap the number of relay hints we add
- d6cfa8a: add NIP-78 interface
- d6cfa8a: properly handled abandoned subscriptions closing
- 722345b: nip-44 support

## 2.10.0

### Minor Changes

- Massive refactor of how subscriptions are fingerprinted, grouped, ungrouped and their internal lifecycle

### Patch Changes

- ec83ddc: fix: close subscription on EOSE at the relay level
- 18c55bb: fix bug where queued items were not getting processed (e.g. zap fetches)
- refactor outbox and be smarter abotu the relays we publish to (account for p-tags and relay hints)
- 18c55bb: Breaking change: event.zap is now removed, use ndk.zap(event) instead
- add filterForEventsTaggingId
- 3029124: add methods to access and manage unpublished events from the cache

## 2.9.1

### Patch Changes

- when a root event is not marked, try to use a reply tag

## 2.9.0

### Minor Changes

- 94018b4: add optimistic updates

### Patch Changes

- 548f4d8: add optimistic updates

## 2.8.2

### Patch Changes

- 0af033f: allow scheduling more than one event
- cache relay reconnection status

## 2.8.1

### Patch Changes

- e40312b: get all profiles that match a filter function from a cahce
- support deprecated replies

## 2.8.0

### Minor Changes

- all-around massive performance improvements

### Patch Changes

- 91d873c: allow offloading signature verification to an async web worker
- 6fd9ddc: threading utility functions
- 0b8f331: fix unfollow function
- optimize serialization and avoid grouping subscriptions that will not close with those that do
- f2898ad: handle more reply cases
- 9b92cd9: Increase performance of signature verification
- allow forcing a tag (for q tagging)
- 6814f0c: fix event fetching from tag when there is no relay hint
- 89b5b3f: nip46 fixes on create_account
- 9b92cd9: fix incorrect tagging when quoting an event
- 27b10cc: correct timestamp of bad events
- fix race condition when using synchronous cache
- ed7cdc4: avoid verifying signatures of cached events

## 2.7.1

### Patch Changes

- fix missing zap spec return

## 2.7.0

### Minor Changes

- Aggregate, cache, deduplicate NIP-05 queries and Zap settings queries -- Massive performance improvement!

### Patch Changes

- Add thread utility functions
- Provide utility functions to make threading events and reply chains way easier

## 2.6.1

### Patch Changes

- error handle url normalization

## 2.6.0

### Minor Changes

- Make outbox calculation great again

### Patch Changes

- Refactor OutboxTracker to handle tracking users in batches
- c2db3c1: Support blocked relays
- c2db3c1: notify caches when events are deleted
- c2db3c1: URL normalization

## 2.5.1

### Patch Changes

- Use nicer reconnection timer
- Fixes fetching of nip46 relays in nip05 implementation (#186)

## 2.5.0

### Minor Changes

- e08fc74: Nostr Wallet Connect support

## 2.4.1

### Patch Changes

- 111c1ea: Add DVM post scheduling
- 5c0ae51: Track all relays the event is seen and encode multiple relays on nevents
- 6f5ea49: bug fix: don't force Article kind
- 3738d39: Big NIP-29 and NIP-88 changes
- d22239a: Add a way to get events inside a list

## 2.4.0

### Minor Changes

- b9bbf1d: Safely embrace the chaos: event validation

## 2.3.3

### Patch Changes

- Introduce new concept of groupableDelayType which describes how the delay should be interpreted ("at least" or "at most")
- 885b6c2: Add nip46 support to nip05 responses
- 5666d56: Fix bug where authors where being added to rewritten filters who weren't included in the original filter

## 2.3.2

### Patch Changes

- NIP-96 support
- 4628481: Improve NIP-31 support
- Make zap more fault-tolerant

## 2.3.1

### Patch Changes

- ece965f: Add support for NIP-46 create_account and bring NIP-46 into compliance with the rewritten NIP

## 2.3.0

### Minor Changes

- 46b0c77: AUTH policies to pre-program how NIP-42 requests should be handled

### Patch Changes

- 54cec78: Allow flagging a relay as auth_required and add "relay:ready" event
- ef61d83: Trust, don't verify -- Allow setting relays/subscriptions as trusted to skip signature verification
- 98b77dd: fix bug of reconnecting subscriptions when the relay of an active subscription comes back
- 082e243: NIP-05 cache

## 2.2.0

### Minor Changes

- fix long subscription IDs bug

## 2.1.3

### Patch Changes

- 180d774: update client tag to new format of NIP-89
- 7f00c40: expose some internals and decouple zapping request generation

## 2.1.2

### Patch Changes

- default to creating nicer looking d-tags for nip-33 events with a title
- allow using a different kind to manage replaceable contact lists

## 2.1.1

### Patch Changes

- Version bump

## 2.1.0

### Minor Changes

- New NIP-46 implementation with auth_url flow

## 2.0.6

### Patch Changes

- Add relay hint to tagging via tagReference
- fix tagging and add more tests

## 2.0.5

### Patch Changes

- d45d962: update DVM job kinds
- Update names to new NIP-51
- d45d962: update DVM job kinds

## 2.0.4

### Patch Changes

-   - Improves content tagging
    - adds mention and relay URL tags
    - adds replaceable event mention tagging

## 2.0.3

### Patch Changes

- add react method to events

## 2.0.2

### Patch Changes

- Static references for replaceable events

## 2.0.0

### Major Changes

- Load and flag muted events

## 1.4.2

### Patch Changes

- Make NIP-07 signer handle better a not-yet-loaded signing extension

## 1.4.1

### Patch Changes

- Automatically fetch main users relays and connect to them

## 1.4.0

### Minor Changes

- add hashtag support to content tagger

## 1.3.2

### Patch Changes

- b3561af: Don't wait for OK on ephemeral events

## 1.3.1

### Patch Changes

- Fix issue when publishing to an explicit relay set where one of the relays is offline

## 1.3.0

### Minor Changes

- cf4a648: Support fetching events from NIP-33 `a` tags
- 3946078: User npub/hexpubkey become optional. This means that if you refer to aser by their
  hexpubkey, npub won't be computed until it's necessary.

    This is a breaking change since hexpubkey goes from being called as function (`hexpubkey()`) to a getter (`hexpubkey`).

- 3440768: User profile dedicated cache

### Patch Changes

- 88df10a: Throw when a user is instantiated without both an npub and pubkey
- c225094: Fetching a relay list from a user will now also inspect kind:3 if the user doesn't have a NIP-65 set
