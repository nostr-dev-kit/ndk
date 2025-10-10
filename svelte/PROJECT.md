# ndk-svelte5 Project Overview

## Vision

A modern, beautiful, and performant Svelte 5 integration for NDK that makes building Nostr apps a joy.

## Current Status

**Phase: Design & Documentation** ✨

This is the north star - a complete vision of what ndk-svelte5 will be. The API design is complete, ready for implementation.

## What We've Defined

### 📚 Documentation

- **README.md** - Complete user-facing documentation with examples
- **API.md** - Full TypeScript API reference
- **DESIGN.md** - Design philosophy and architectural decisions
- **EXAMPLES.md** - Real-world patterns and recipes
- **PROJECT.md** - This file

### 🎯 Core Features Defined

1. **Reactive Subscriptions**
   - `EventSubscription<T>` class using Svelte 5 runes
   - Automatic lifecycle management
   - Buffered updates (30ms default, 16ms post-EOSE)
   - Smart deduplication
   - Type-safe event conversion

2. **Global Stores**
   - Profile store (automatic fetching and caching)
   - Session store (multi-user authentication)
   - Mute store (NIP-51 mute lists)
   - Wallet store (ndk-wallet integration)

3. **Advanced Features**
   - Reference counting for shared subscriptions
   - Repost handling
   - Deleted event filtering
   - Muted content filtering
   - Pagination support
   - Reactive filters

4. **Components** (planned)
   - UserAvatar
   - UserName
   - UserProfile
   - WalletBalance
   - WalletHistory
   - PaymentButton
   - InfiniteScroll
   - VirtualList

## Architecture

```
ndk-svelte5/
├── src/
│   ├── lib/
│   │   ├── index.ts                    # Main NDKSvelte class
│   │   ├── subscription.svelte.ts      # EventSubscription class
│   │   ├── reactive-event.svelte.ts    # ReactiveEvent class
│   │   ├── reactive-filter.svelte.ts   # ReactiveFilter class
│   │   ├── stores/
│   │   │   ├── index.ts
│   │   │   ├── profiles.svelte.ts      # Profile store
│   │   │   ├── sessions.svelte.ts      # Session store
│   │   │   ├── mutes.svelte.ts         # Mute store
│   │   │   └── wallet.svelte.ts        # Wallet store
│   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── user/
│   │   │   │   ├── Avatar.svelte
│   │   │   │   ├── Name.svelte
│   │   │   │   └── Profile.svelte
│   │   │   ├── wallet/
│   │   │   │   ├── Balance.svelte
│   │   │   │   ├── History.svelte
│   │   │   │   └── PaymentButton.svelte
│   │   │   └── utils/
│   │   │       ├── InfiniteScroll.svelte
│   │   │       └── VirtualList.svelte
│   │   └── utils/
│   │       ├── buffering.ts
│   │       ├── deduplication.ts
│   │       └── filtering.ts
│   └── tests/
│       ├── subscription.test.ts
│       ├── stores.test.ts
│       └── components.test.ts
├── docs/
│   ├── README.md
│   ├── API.md
│   ├── DESIGN.md
│   ├── EXAMPLES.md
│   └── PROJECT.md
└── package.json
```

## Key Design Decisions

### 1. Runes-First Architecture

Use Svelte 5's `$state`, `$derived`, and `$effect` throughout:

```typescript
class EventSubscription<T extends NDKEvent> {
  events = $state<T[]>([]);
  eosed = $state(false);
  count = $derived(this.events.length);

  constructor() {
    $effect(() => {
      return () => this.stop(); // Auto-cleanup
    });
  }
}
```

### 2. No Backwards Compatibility

Clean break from ndk-svelte. Modern, Svelte 5-only code.

### 3. Progressive Rendering

Events stream in and render immediately. No "loading" states based on EOSE.

```svelte
<!-- Just render events as they arrive -->
{#each notes.events as note}
  <Note {note} />
{/each}
```

### 4. Performance by Default

- Buffered updates (configurable)
- Smart deduplication
- Lazy loading
- Reference counting for shared subscriptions

### 5. Beautiful APIs

```typescript
// ✅ Good: Clear, concise
const notes = ndk.$subscribe([{ kinds: [1] }]);
const profile = profiles.get(pubkey);

// ❌ Bad: Verbose, unclear
const notesStore = $ndk.storeSubscribe([{ kinds: [1] }]);
const profile = $profiles.getProfile(pubkey);
```

## Implementation Roadmap

### Phase 1: Core Foundation
- [ ] NDKSvelte class extending NDK
- [ ] EventSubscription class with runes
- [ ] Basic subscription lifecycle
- [ ] Buffering system
- [ ] Deduplication logic
- [ ] Auto-cleanup with effects

### Phase 2: Global Stores
- [ ] Profile store
- [ ] Session store
- [ ] Mute store
- [ ] Store persistence layer

### Phase 3: Advanced Features
- [ ] Repost handling
- [ ] Reference counting
- [ ] Reactive filters
- [ ] Pagination support
- [ ] Deleted event filtering
- [ ] Muted content filtering

### Phase 4: Wallet Integration
- [ ] Wallet store
- [ ] NDKCashuWallet integration
- [ ] Nutzap monitoring
- [ ] Transaction history

### Phase 5: Components
- [ ] User components (Avatar, Name, Profile)
- [ ] Wallet components (Balance, History, PaymentButton)
- [ ] Utility components (InfiniteScroll, VirtualList)

### Phase 6: Polish
- [ ] Comprehensive tests
- [ ] Documentation site
- [ ] Example apps
- [ ] Performance benchmarks
- [ ] Migration guide

## Testing Strategy

### Unit Tests
- EventSubscription lifecycle
- Store operations
- Filtering logic
- Deduplication
- Buffering behavior

### Integration Tests
- NDK integration
- Relay communication
- Wallet operations
- Session management

### E2E Tests
- Complete user flows
- Multi-component interactions
- Performance tests

## Dependencies

### Required
- `@nostr-dev-kit/ndk` - Core NDK library
- `svelte` ^5.0.0 - Svelte 5 framework

### Optional
- `@nostr-dev-kit/ndk-wallet` - Wallet functionality
- `@nostr-dev-kit/mobile` - Mobile signer support

### Dev
- `vite` - Build tool
- `vitest` - Testing
- `@sveltejs/package` - Package builder
- `typescript` - Type checking

## Performance Goals

- **First render**: <50ms
- **Event processing**: <5ms per event
- **Memory**: <50MB for 10k events
- **Bundle size**: <20KB gzipped

## Examples to Build

1. **Simple Feed** - Basic note feed
2. **Multi-user App** - Account switching
3. **Chat App** - Real-time messaging
4. **Wallet Demo** - Payment flows
5. **Thread Viewer** - Nested replies
6. **Profile Editor** - Update profiles
7. **Advanced Filtering** - Mutes and filters

## Success Criteria

- ✅ Beautiful, intuitive API
- ✅ Zero manual cleanup required
- ✅ Type-safe by default
- ✅ Performant with large datasets
- ✅ Comprehensive documentation
- ✅ Real-world examples
- ✅ Active community adoption

## Inspirations

- **Svelte 5 Runes** - Native reactivity
- **TanStack Query** - Async state management
- **ndk-hooks** - React patterns for Nostr
- **SolidJS** - Fine-grained reactivity
- **Zustand** - Simple stores

## Community

- **Discussions**: GitHub Discussions
- **Issues**: GitHub Issues
- **Examples**: Community examples repo
- **Discord**: Nostr Dev Kit server

## License

MIT

---

## Next Steps

1. ✅ Complete API design and documentation
2. Implement core EventSubscription class
3. Build global stores
4. Create example apps
5. Write comprehensive tests
6. Launch beta
7. Gather feedback
8. Iterate to v1.0

---

**This is the north star. Let's build something beautiful.** ✨
