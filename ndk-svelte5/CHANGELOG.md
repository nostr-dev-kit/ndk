# Changelog

All notable changes to ndk-svelte5 will be documented in this file.

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

#### Reactive Classes
- **ReactiveEvent**: Events with live reactive properties
  - `deleted` - Tracks deletion status
  - `reactions` - Live reaction counts by emoji
  - `zaps` - Total zap amount in sats
  - `replyCount` - Live reply count
  - Methods: `addReaction()`, `createReply()`, `destroy()`

- **ReactiveFilter**: Dynamic filters that auto-update subscriptions
  - Reactive properties: `ids`, `kinds`, `authors`, `since`, `until`, `limit`
  - Tag filter support: `setTag()`, `getTag()`
  - Utilities: `toFilter()`, `clone()`, `merge()`, `clear()`
  - `isEmpty` derived property

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
  - ReactiveEvent (13 tests)
  - ReactiveFilter (22 tests)
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
