# NDK

<img src="https://raw.githubusercontent.com/nvk/ndk.fyi/master/ndk.svg" alt="drawing" width="200"/>

![Tests](https://github.com/nostr-dev-kit/ndk/actions/workflows/deploy.yml/badge.svg)

**NDK (Nostr Development Kit)** is a comprehensive toolkit for building [Nostr](https://github.com/nostr-protocol/nostr) applications. It's a monorepo containing everything you need to create modern, performant, and feature-rich Nostr clients, from reactive UI bindings to advanced protocols like Web of Trust and Negentropy sync.

## Why NDK?

- **🚀 Modern & Performant** - Built with TypeScript, optimized for real-world use
- **🎯 Framework Integration** - First-class support for Svelte 5, React, and React Native
- **🔐 Advanced Features** - Web of Trust, Negentropy sync, multi-account sessions, wallet integration
- **💾 Flexible Caching** - Multiple adapters (Dexie, Redis, SQLite, in-memory, Nostr relay)
- **📦 Modular** - Use only what you need, from core to specialized packages
- **🎨 Beautiful APIs** - Intuitive, well-documented, and type-safe

## Packages

### Core

| Package | Version | Description |
|---------|---------|-------------|
| [`@nostr-dev-kit/ndk`](./core) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/ndk) | Core NDK library with event handling, subscriptions, and relay management |

### Framework Integration

| Package | Version | Description |
|---------|---------|-------------|
| [`@nostr-dev-kit/svelte`](./svelte) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/svelte) | Modern Svelte 5 integration with reactive runes |
| [`@nostr-dev-kit/react`](./react) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/react) | React hooks for NDK |
| [`@nostr-dev-kit/mobile`](./mobile) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/mobile) | React Native integration |

### Advanced Features

| Package | Version | Description |
|---------|---------|-------------|
| [`@nostr-dev-kit/messages`](./messages) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/messages) | High-level messaging with NIP-17 DMs and conversation management |
| [`@nostr-dev-kit/sessions`](./sessions) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/sessions) | Multi-account session management with persistence |
| [`@nostr-dev-kit/wot`](./wot) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/wot) | Web of Trust filtering and ranking |
| [`@nostr-dev-kit/sync`](./sync) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/sync) | NIP-77 Negentropy set reconciliation |
| [`@nostr-dev-kit/wallet`](./wallet) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/wallet) | Wallet integration (Cashu, NWC, WebLN) |
| [`@nostr-dev-kit/blossom`](./blossom) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/blossom) | Blossom media server protocol |

### Cache Adapters

| Package | Version | Description |
|---------|---------|-------------|
| [`@nostr-dev-kit/cache-memory`](./cache-memory) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/cache-memory) | In-memory LRU cache |
| [`@nostr-dev-kit/cache-dexie`](./cache-dexie) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/ndk-cache-dexie) | IndexedDB cache using Dexie |
| [`@nostr-dev-kit/cache-redis`](./cache-redis) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/ndk-cache-redis) | Redis cache for server-side |
| [`@nostr-dev-kit/cache-sqlite`](./cache-sqlite) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/ndk-cache-sqlite) | SQLite cache |
| [`@nostr-dev-kit/cache-sqlite-wasm`](./cache-sqlite-wasm) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/ndk-cache-sqlite-wasm) | SQLite WASM for web workers |
| [`@nostr-dev-kit/cache-nostr`](./cache-nostr) | ![npm](https://img.shields.io/npm/v/@nostr-dev-kit/ndk-cache-nostr) | Use a Nostr relay as cache |

## Quick Start

### Svelte 5

```typescript
import { NDKSvelte } from '@nostr-dev-kit/svelte';
import NDKCacheDexie from '@nostr-dev-kit/ndk-cache-dexie';

const ndk = new NDKSvelte({
  explicitRelayUrls: ['wss://relay.damus.io', 'wss://relay.nostr.band'],
  cacheAdapter: new NDKCacheDexie({ dbName: 'my-app' })
});

ndk.connect();

// Reactive subscriptions with Svelte 5 runes
const notes = ndk.subscribe({ kinds: [1], limit: 50 });

// Access reactive properties in your template
notes.events;  // Array of events (reactive)
notes.eosed;   // EOSE flag (reactive)
```

### React

```typescript
import { useSubscription } from '@nostr-dev-kit/react';

function Feed() {
  const { events, eosed } = useSubscription({ kinds: [1], limit: 50 });

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.content}</div>
      ))}
    </div>
  );
}
```

### Vanilla JavaScript

```typescript
import NDK from '@nostr-dev-kit/ndk';

const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.damus.io']
});

await ndk.connect();

const sub = ndk.subscribe({ kinds: [1], limit: 50 }, {
  onEvent: (event) => {
    console.log('New note:', event.content);
  }
});
```

## Key Features

### 🌐 Web of Trust

Filter and rank content using social graph analysis:

```typescript
import { NDKSvelte } from '@nostr-dev-kit/svelte';

const ndk = new NDKSvelte(config);

// Load WoT data
await ndk.wot.load({ maxDepth: 2 });

// Enable automatic filtering on all subscriptions
ndk.wot.enableAutoFilter({
  maxDepth: 2,
  minScore: 0.5,
  includeUnknown: false
});

// All subscriptions now automatically filter by WoT
const notes = ndk.subscribe({ kinds: [1] });
```

### 🔄 Negentropy Sync

Efficient set reconciliation using NIP-77:

```typescript
import { NDKSync } from '@nostr-dev-kit/sync';

const sync = new NDKSync(ndk);

// Sync events efficiently with set reconciliation
await sync.syncFilter(
  { kinds: [1], authors: [pubkey] },
  relayUrl,
  { initialBackfillSeconds: 86400 * 7 }  // Last 7 days
);
```

### 👤 Multi-Account Sessions

Built-in session management with automatic persistence:

```typescript
import { NDKNip07Signer } from '@nostr-dev-kit/ndk';

// Login with browser extension
const signer = new NDKNip07Signer();
await ndk.sessions.login(signer);

// Switch between accounts
ndk.sessions.switch(otherPubkey);

// Access current user
const currentUser = ndk.sessions.currentUser;
const profile = ndk.sessions.profile;
const follows = ndk.sessions.follows;
```

### 💰 Wallet Integration

Seamless wallet support for Cashu, NWC, and WebLN:

```typescript
import { NDKCashuWallet } from '@nostr-dev-kit/wallet';

const wallet = new NDKCashuWallet(ndk);
await wallet.init();
ndk.wallet.set(wallet);

// Reactive balance
const balance = ndk.wallet.balance;

// Send payments
await wallet.cashuPay({ amount: 1000, unit: 'sat', target: event });
```

## NIPs Support

- ✅ **NIP-01** - Basic protocol
- ✅ **NIP-04** - Encrypted Direct Messages
- ✅ **NIP-07** - Browser extension signer
- ✅ **NIP-17** - Gift-wrap DMs
- ✅ **NIP-18** - Repost + Generic Reposts
- ✅ **NIP-22** - Generic Comments
- ✅ **NIP-23** - Long-form content
- ✅ **NIP-29** - Simple groups
- ✅ **NIP-42** - Relay authentication
- ✅ **NIP-44** - Encrypted payloads
- ✅ **NIP-46** - Remote signing (nsecBunker)
  - ✅ Permission tokens
  - ✅ OAuth flow
- ✅ **NIP-47** - Nostr Wallet Connect
- ✅ **NIP-57** - Zaps (LUD06, LUD16)
- ✅ **NIP-59** - Gift wraps
- ✅ **NIP-60** - Cashu wallet
- ✅ **NIP-61** - Nutzaps
- ✅ **NIP-65** - Relay list metadata
- ✅ **NIP-77** - Negentropy set reconciliation
- ✅ **NIP-89** - Application handlers
- ✅ **NIP-90** - Data Vending Machines

## Core Features

### Subscription Management
- Auto-grouping queries
- Auto-closing subscriptions
- Reactive subscriptions
- Buffered updates for performance
- Smart deduplication

### Signing Adapters
- Private key
- Browser extension (NIP-07)
- nsecBunker (NIP-46)
- OAuth flow support

### Relay Discovery
- Outbox model (NIP-65)
- Explicit relay blacklist
- Smart relay selection

### Caching
- Multiple adapters (memory, IndexedDB, SQLite, Redis)
- Extensible module system for package-specific collections
- Automatic cache invalidation
- Server-side and client-side support

### Developer Experience
- **AI Guardrails** - Optional runtime validation to catch common mistakes
- Educational error messages with actionable fixes
- Granular configuration (enable/disable specific checks)
- Zero performance impact when disabled

## Documentation

📚 **[Full Documentation](https://nostr-dev-kit.github.io/ndk/getting-started/introduction.html)**

### Package Documentation

- [Messages](./messages/README.md)
- [Svelte 5 Integration](./svelte/README.md)
- [Sessions](./sessions/README.md)
- [Web of Trust](./wot/README.md)
- [Negentropy Sync](./sync/README.md)
- [Wallet](./wallet/README.md)

## Examples

Explore working examples in the [examples directory](./svelte/examples):

- **[Basic Feed](./svelte/examples/basic-feed)** - Simple note feed with profiles
- **[Nutsack](./svelte/examples/nutsack)** - NIP-60 Cashu wallet with payment tracking
- **[Sessions Demo](./svelte/examples/sessions-demo)** - Multi-account session management
- **[WoT Demo](./svelte/examples/wot-demo)** - Web of Trust filtering
- **[Event Graph](./svelte/examples/event-graph)** - Event relationship visualization
- **[Constellation](./svelte/examples/constellation)** - Full-featured Nostr client

## Real-World Applications

See [REFERENCES.md](./REFERENCES.md) for a comprehensive list of production applications built with NDK, including:

- **Highlighter** - Long-form content platform
- **Lume** - Desktop Nostr client
- **Flockstr** - Event management
- **Ostrich.work** - Project management
- **And many more...**

## Contributing

NDK is open source and we welcome contributions! Whether it's:

- 🐛 Bug reports
- 💡 Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions

Check out our [GitHub repository](https://github.com/nostr-dev-kit/ndk) to get started.

## Development

```bash
# Clone the repository
git clone https://github.com/nostr-dev-kit/ndk.git
cd ndk

# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun test

# Start development mode
bun run dev
```

## Community

- **GitHub**: [nostr-dev-kit/ndk](https://github.com/nostr-dev-kit/ndk)
- **Documentation**: [ndk.fyi](https://nostr-dev-kit.github.io/ndk)
- **Issues**: [Bug reports & feature requests](https://github.com/nostr-dev-kit/ndk/issues)

## License

MIT

## Credits

Built with ❤️ by [@pablof7z](https://njump.me/npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft) and the Nostr community.
