# NIP-17 with Cache Example

This example demonstrates using the `@nostr-dev-kit/messages` package with NDK's cache module system for persistent storage.

## Features

- 🔐 NIP-17 encrypted direct messages
- 💾 Persistent storage using IndexedDB via Dexie
- 🔄 Messages survive app restarts
- 📊 Cache statistics and management
- 🧩 Modular cache architecture

## Architecture

This example shows the integration between:
1. **Messages Package**: High-level messaging API
2. **Cache Module System**: Pluggable storage modules
3. **Dexie Cache Adapter**: IndexedDB implementation

```typescript
// The cache adapter supports module registration
const cacheAdapter = new NDKCacheAdapterDexie({
    dbName: `ndk-messages-${currentUser}`
});

// Messages package uses cache module storage
const messenger = new NDKMessenger(ndk, {
    storage: new CacheModuleStorage(cacheAdapter, userPubkey)
});
```

## Setup

1. Generate test keys:
```bash
bun run generate-keys
```

2. Install dependencies:
```bash
bun install
```

## Usage

Run commands as Alice (default):
```bash
bun start send "Hello Bob!"
bun start list
bun start read
bun start listen
```

Run commands as Bob:
```bash
USER=bob bun start send "Hi Alice!"
USER=bob bun start list
USER=bob bun start read
```

## Commands

- `send <message>` - Send a message to the other user
- `list` - Show all conversations
- `read` - Read messages in a conversation
- `listen` - Listen for incoming messages in real-time
- `stats` - Show cache statistics
- `clear` - Clear all cached messages

## How It Works

1. **Module Registration**: The messages package defines a cache module with collections for messages, conversations, and DM relays.

2. **Automatic Migrations**: When the module is registered, migrations run to create the necessary database structure.

3. **Type-Safe Storage**: The cache module provides typed collections with indexes for efficient querying.

4. **Persistent Storage**: All messages are stored in IndexedDB and survive browser/app restarts.

5. **Cross-Session State**: Each user has their own database (`ndk-messages-alice`, `ndk-messages-bob`).

## Cache Module Benefits

- **Separation of Concerns**: Cache adapters handle I/O, packages define data shapes
- **Automatic Migrations**: Version management and schema upgrades
- **Type Safety**: Strongly typed collections and queries
- **Performance**: Indexed fields for fast lookups
- **Modularity**: Multiple packages can register their own modules

## Database Structure

The messages module creates these collections:
- `messages` - Individual messages with indexes on conversationId, timestamp, sender
- `conversations` - Conversation metadata with participant tracking
- `mlsGroups` - (Future) MLS group state
- `dmRelays` - Relay preferences for DMs