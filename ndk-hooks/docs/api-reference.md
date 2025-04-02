# NDK Hooks API Reference

This document provides a reference for the React hooks available in the `ndk-hooks` package. These hooks simplify interaction with the Nostr Development Kit (NDK) and manage related state within a React application.

**Important Note on Created Instances:** Some hooks (like `useNDKSessionEvent`) offer a `create` option to instantiate new `NDKEvent` objects if one doesn't exist in the session. Please be aware that these newly created instances are **intentionally not** automatically saved to the session store or published to relays. They are returned for immediate use, allowing modification before potential persistence. Developers are responsible for explicitly saving or publishing these events if required.

## Core NDK Hooks (`ndk-hooks/src/hooks/ndk.ts`)

These hooks manage the core NDK instance and related global state.

### `useNDK`

*   **Purpose**: This fundamental hook serves as the primary entry point for accessing the shared NDK (Nostr Development Kit) instance within your application components. It retrieves the current `NDK` object managed by the central `useNDKStore`. Beyond just providing access, it also returns essential functions for managing the NDK state: `setNDK` allows replacing the NDK instance entirely (useful during initialization or reconfiguration), `addSigner` facilitates adding new signing capabilities (like NIP-07 or local private keys), and `switchToUser` enables changing the active user context within the NDK instance. The hook ensures reference stability by memoizing its return value, preventing unnecessary re-renders in consuming components. It provides the foundation for interacting with the NDK throughout your application.
*   **File**: `ndk-hooks/src/hooks/ndk.ts`
*   **Returns**: `{ ndk: NDK, setNDK: (ndk: NDK) => void, addSigner: (pubkey: Hexpubkey, signer: NDKSigner, setActive?: boolean) => Promise<void>, switchToUser: (pubkey: Hexpubkey) => Promise<void> }`

### `useNDKCurrentUser`

*   **Purpose**: A simple yet crucial selector hook designed to provide direct access to the `NDKUser` object representing the currently active user within the NDK instance. This is derived from the state managed by `useNDKStore`. It simplifies obtaining user-specific information like the public key (`pubkey`), profile details, or associated signer, without needing to manually extract it from the main `useNDK` hook's return value. This hook is essential for components that need to display user information, personalize content, or perform actions on behalf of the logged-in user, ensuring they always reference the correct user context managed by the NDK state. It offers a convenient shortcut to the most relevant user object.
*   **File**: `ndk-hooks/src/hooks/ndk.ts`
*   **Returns**: `NDKUser | undefined`

### `useNDKUnpublishedEvents`

*   **Purpose**: This hook provides a mechanism to track Nostr events that have been created but failed to publish successfully to relays. It actively listens for `event:publish-failed` events emitted by the NDK instance. Crucially, its functionality depends on the configured NDK cache adapter implementing a specific method: `getUnpublishedEvents`. If the cache adapter supports this, the hook retrieves the list of unpublished events from the cache and updates its state whenever a publish failure occurs or when the NDK instance changes. It returns an array of objects, each containing the `NDKEvent` itself, optionally the specific relays it failed on, and the timestamp of the last attempt. This allows developers to build UI elements displaying pending/failed publications and potentially offer retry mechanisms for improved reliability.
*   **File**: `ndk-hooks/src/hooks/ndk.ts`
*   **Returns**: `{ event: NDKEvent; relays?: WebSocket["url"][]; lastTryAt?: number }[]`

### `useNDKInit`

*   **Purpose**: This hook provides a dedicated initialization function, `initializeNDK`, designed to be called once during your application's setup phase (e.g., in the root component or context provider). Its primary role is to take a pre-configured `NDK` instance and register it with the central `useNDKStore`. Importantly, it also orchestrates the initialization of other dependent stores that require the NDK instance to function correctly, such as the `useUserProfilesStore`. By centralizing the initialization logic, this hook ensures that the NDK instance and related subsystems are set up in the correct order, preventing potential race conditions or errors related to accessing uninitialized resources before they are ready.
*   **File**: `ndk-hooks/src/hooks/ndk.ts`
*   **Returns**: `(ndkInstance: NDK) => void`

## Subscription Hooks

These hooks manage subscriptions to Nostr events.

### `useSubscribe`

*   **Purpose**: This is the core hook for establishing and managing live subscriptions to Nostr events based on specified filters (`NDKFilter[]`). It provides a reactive interface to Nostr data streams, returning an array of received events (`events`) and a boolean flag (`eose`) indicating when the initial burst of stored events from relays has been received. Unlike `useObserver` which defaults to cache-only, `useSubscribe` actively listens for new events from relays according to the provided `NDKSubscriptionOptions`. It incorporates several advanced features: optional event wrapping (`wrap`) into specific NDK classes (like `NDKList`), optional inclusion of deleted events (`includeDeleted`), configurable event buffering (`bufferMs`) to batch updates and reduce re-renders, and automatic filtering of events based on the active session's mute list (`includeMuted` option, defaults to `false`). It efficiently manages the underlying `NDKSubscription` lifecycle, handles event deduplication, and processes deletion events correctly. The hook uses a dedicated Zustand store internally for state management and provides robust handling of dependencies to re-subscribe when necessary.
*   **File**: `ndk-hooks/src/hooks/subscribe.ts`
*   **Returns**: `{ events: T[], eose: boolean, subscription: NDKSubscription | null, storeRef: RefObject<SubscribeStore<T>> }` (where T extends NDKEvent)
*   **Flag**: The `wot` (Web of Trust) filtering option is mentioned but marked as "Implementation TBD," indicating it's not yet functional. The hook exposes its internal `storeRef` in the return value, which seems intended for testing but might be confusing for general usage.

### `useObserver`

*   **Purpose**: This hook is specifically tailored for efficiently fetching and observing Nostr events, primarily leveraging the NDK's cache. It acts like a reactive query mechanism for Nostr data. You provide it with NDK filters (defining the kinds, authors, tags, etc., you're interested in), and it returns an array of matching `NDKEvent` objects. Its key strength lies in its optimizations: by default, it fetches events synchronously and *only* from the cache (`ONLY_CACHE`), making it ideal for quickly displaying readily available data without hitting the network. It includes robust deduplication based on event `tagId` to prevent duplicates in the results. For events arriving asynchronously (if cache usage is changed from the default), it employs a short buffering mechanism (50ms) to batch updates, minimizing component re-renders and improving UI performance. The hook automatically manages the underlying NDK subscription lifecycle, starting it when the component mounts or filters change, and stopping it cleanly on unmount or filter updates. It uses sensible defaults for observer-like subscriptions (e.g., `closeOnEose: true`, `skipVerification: true`) but allows customization via the `opts` parameter. It also supports a dependency array to trigger re-subscription when external values change.
*   **File**: `ndk-hooks/src/hooks/observer.ts`
*   **Returns**: `T[]` (where T extends NDKEvent)
*   **Flag**: The default behavior relies heavily on the cache (`ONLY_CACHE`). If the cache is empty or doesn't contain the desired events, the hook will return an empty array unless the `cacheUsage` option is explicitly overridden in the `opts` parameter (e.g., to `CACHE_FIRST` or `RELAY_ONLY`). This cache-centric default should be highlighted. The internal buffering logic adds a slight delay (50ms) to asynchronous updates, which might be noticeable in highly real-time scenarios if not using `ONLY_CACHE`.

## Session & User Data Hooks

These hooks provide access to data related to the active user session and profiles.

### `useAvailableSessions`

*   **Purpose**: This hook provides a simple way to determine which user accounts or "sessions" are currently available for the user to potentially switch between within the application. It achieves this by inspecting the central `useNDKStore` to find all configured signers (e.g., NIP-07 extension, local private key signers added via `useNDK().addSigner`). Each signer is associated with a specific public key (`Hexpubkey`). The hook extracts these public keys and returns them as an array. This list represents the identities the application knows how to sign events for, effectively listing the available user sessions. The hook memoizes the result to ensure the returned array reference is stable unless the underlying set of signers actually changes, optimizing performance for components that might use this list (e.g., an account switcher dropdown).
*   **File**: `ndk-hooks/src/hooks/useAvailableSessions.ts`
*   **Returns**: `{ availablePubkeys: Hexpubkey[] }`

### `useProfile`

*   **Purpose**: This hook simplifies fetching and accessing a specific Nostr user's profile (`NDKUserProfile`). Given a `Hexpubkey`, it retrieves the profile. **New Behavior**: If the provided `pubkey` matches the currently active session's public key (obtained via `useNDKSessions`) AND the `forceRefresh` parameter is *not* set to `true`, the hook will delegate to `useCurrentUserProfile` and return the profile managed within the session context, **improving performance by leveraging the already loaded profile from the active session.** **Original Behavior**: In all other cases (different pubkey, no active session, or `forceRefresh` is `true`), it interacts with the central `useUserProfilesStore`. If the profile isn't in the store's cache or `forceRefresh` is true, it triggers a fetch from relays. It reactively returns the `NDKUserProfile` or `undefined`. It uses `useShallow` for efficient state selection.
*   **File**: `ndk-hooks/src/hooks/profile.ts`
*   **Returns**: `NDKUserProfile | undefined`
*   **Flag**: Contains `console.log` statements which might be undesirable in a production build. These are likely development artifacts.


### `useCurrentUserProfile`

*   **Purpose**: This hook simplifies retrieving the profile information (`NDKUserProfile`) for the user associated with the *currently active session*. It leverages the `useProfile` hook internally, using the active user's pubkey obtained from the session state (via `useNDKSessions`), to fetch and return the corresponding profile data. This provides a convenient way to access the logged-in user's profile details without manually managing the active pubkey and profile fetching logic separately.
*   **File**: `ndk-hooks/src/hooks/session.ts`
*   **Returns**: `NDKUserProfile | undefined`

### `useFollows`

*   **Purpose**: This hook provides a straightforward way to access the list of public keys (`Hexpubkey`) that the currently active user is following. It directly taps into the processed data within the active session state, specifically looking for the `followSet` which is derived and maintained from the user's Kind 3 (Contact List) event. The hook returns an array of strings, where each string is a hex public key of a followed user. If there is no active session currently selected in the application, or if the active session data doesn't yet include a processed follow list (perhaps the Kind 3 event hasn't been fetched or processed), the hook gracefully returns an empty array. This makes it safe to use in components without complex conditional checks, ensuring you always get an array, even if it's empty, representing the user's follows.
*   **File**: `ndk-hooks/src/hooks/session.ts`
*   **Returns**: `string[]`

### `useMuteList`

*   **Purpose**: This hook offers comprehensive access to the active user's mute preferences, as defined by their Kind 10000 (Mute List) event. It returns an object containing several useful pieces of data derived from the session state. This includes distinct sets (`Set<string>`) for `mutedPubkeys` (users to mute), `mutedHashtags` (topics to mute, case-insensitive), `mutedWords` (keywords to mute, case-insensitive), and `mutedEventIds` (specific events or threads to mute). Additionally, it provides the raw `NDKEvent` object for the Kind 10000 list itself (`event`), allowing for direct inspection or display of the original list data if needed. If no user session is active, the hook returns default empty sets for all categories and `undefined` for the raw event, ensuring consuming components receive predictable data structures. This hook is essential for implementing content filtering based on user preferences.
*   **File**: `ndk-hooks/src/hooks/session.ts`
*   **Returns**: `{ pubkeys: Set<string>, hashtags: Set<string>, words: Set<string>, eventIds: Set<string>, event: NDKEvent | undefined }`

### `useNDKSessionEvent`

*   **Purpose**: This versatile hook allows retrieving specific replaceable events (events where only the latest version per user per kind matters, like Kind 0, 3, 10000, 10002, 30000, etc.) directly from the active user's session data. You specify the `NDKKind` you're interested in. The hook checks the session's `replaceableEvents` map for an existing event of that kind. A key feature is the optional `create` parameter: if you provide a class constructor (e.g., `NDKList` for list events) and no event of the specified kind exists in the session, the hook will instantiate a *new*, empty object of that class, associate it with the current NDK instance and the active user's pubkey (if applicable), and return it. This is incredibly useful for scenarios where you need to interact with a list (like adding an item) even if the user hasn't explicitly created that list on Nostr yet. If `create` is not provided or fails, and the event isn't found, it returns `undefined`. Function overloading ensures type safety, guaranteeing a return value if `create` is used.
*   **File**: `ndk-hooks/src/hooks/session.ts`
*   **Returns**: `T | undefined` (or `T` if `create` option is provided and required) (where T extends NDKEvent)
*   **Flag**: When the `create` option is used, the hook instantiates the provided class (which extends `NDKEvent` and thus has a `pubkey`) and assigns the active session's pubkey. **Important**: This newly created instance is intentionally *not* automatically saved back to the session store or published to relays. It is returned solely for immediate use (e.g., modification before publishing). Developers must explicitly handle saving or publishing the event if persistence is required. See the general note at the beginning of this document regarding created instances.

## Muting Hooks (`ndk-hooks/src/hooks/mute.ts`)

These hooks help manage content muting based on session preferences.

### `useMuteFilter`

*   **Purpose**: This hook provides a highly optimized function designed to determine if a specific Nostr event (`NDKEvent`) should be considered 'muted' or filtered out based on the currently active user session's preferences. It leverages the mute lists configured within the session, which can include muted public keys (authors), specific event IDs, hashtags (case-insensitive), and keywords (using case-insensitive regular expressions). The hook is built for performance, employing memoization (`useMemo`, `useCallback`) to avoid unnecessary recalculations of mute criteria or the filter function itself, ensuring smooth UI performance even with frequent event processing. It efficiently checks against the various mute criteria, prioritizing simpler checks like pubkey matching before moving to more complex tag and content analysis. It returns a simple boolean function for easy integration into event filtering logic.
*   **File**: `ndk-hooks/src/hooks/mute.ts`
*   **Returns**: `(event: NDKEvent) => boolean` (returns `true` if event should be muted)

### `useMuteItem`

*   **Purpose**: This hook offers a convenient function to add an item to the active user session's mute list. It simplifies the process of muting different types of Nostr entities: entire users (`NDKUser` instance, muting their pubkey), specific events (`NDKEvent` instance, muting its ID), hashtags (string starting with '#', e.g., "#spam"), or specific words/phrases (any other string). The hook interacts directly with the underlying session management store (`useNDKSessions`) to update the mute list persistently. By default, it also triggers the publication of an updated kind 10000 (Mute List) event to the user's relays, ensuring the mute preferences are synchronized across different clients or devices. This publication behavior can be optionally disabled via a parameter.
*   **File**: `ndk-hooks/src/hooks/mute.ts`
*   **Returns**: `(item: NDKEvent | NDKUser | string, publish?: boolean) => void`

## Wallet Hooks (`ndk-hooks/src/hooks/wallet.ts`)

These hooks manage Nostr Wallet Connect (NWC) and related functionalities like Nutzap monitoring.

### `useNDKWallet`

*   **Purpose**: This hook provides essential functionality for managing an active Nostr Wallet Connect (`NDKWallet`) instance within your application. It allows you to set the currently active wallet using the `setActiveWallet` function (which also updates the core `ndk.wallet` instance) and unset it by passing `null`. The hook maintains the state of the `activeWallet` object itself and reactively tracks its `balance` (in satoshis). It automatically listens for `ready` and `balance_updated` events emitted by the `NDKWallet` instance to keep the balance state synchronized. Balance updates are debounced slightly (50ms) for performance. This hook simplifies integrating NWC functionality, enabling components to easily display wallet connection status, balance, and trigger wallet-related actions through the `activeWallet` object. It uses an internal store for managing its state.
*   **File**: `ndk-hooks/src/hooks/wallet.ts`
*   **Returns**: `{ activeWallet: NDKWallet | null, setActiveWallet: (wallet: NDKWallet | null) => void, balance: number | null, setBalance: (balance: number | null) => void }`
*   **Flag**: Uses an internal Zustand store (`useInternalWalletStore`) for its state, separate from other potential state stores. The listener cleanup logic when switching wallets might need review depending on `NDKWallet`'s internal behavior.

### `useNDKNutzapMonitor`

*   **Purpose**: This hook facilitates the monitoring of incoming "Nutzaps" – zaps paid using Cashu using NIP-61. It manages an instance of `NDKNutzapMonitor` from the `@nostr-dev-kit/ndk-wallet` package. The hook automatically initializes the monitor based on the current NDK instance, the active user (`useNDKCurrentUser`), and the active NWC wallet (`useNDKWallet`). It can optionally be configured with a specific `mintList` for Cashu mints. A key feature is its attempt to integrate with the NDK's `cacheAdapter` for persistence: if the adapter provides `getAllNutzapStates` and `setNutzapState` methods, the monitor will use them to store and retrieve the processing state of received nutzaps, preventing duplicate processing across sessions. The hook also handles starting and stopping the monitor based on a `start` parameter and the component's lifecycle. It returns the `nutzapMonitor` instance, allowing interaction with its methods and events.
*   **File**: `ndk-hooks/src/hooks/wallet.ts`
*   **Returns**: `{ nutzapMonitor: NDKNutzapMonitor | null }`
*   **Flag**: Uses an internal Zustand store (`useInternalNutzapMonitorStore`). Its persistence capability is entirely dependent on the configured NDK `cacheAdapter` implementing `getAllNutzapStates` and `setNutzapState`.