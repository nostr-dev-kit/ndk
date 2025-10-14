# @nostr-dev-kit/messages

High-level messaging library for NDK that provides a unified API for private messaging protocols on Nostr.

## Features

- 🎯 **Simple API** - One-line message sending with automatic protocol handling
- 🔐 **NIP-17 Support** - Gift-wrapped private messages with proper relay management
- 💬 **Conversation Management** - Automatic grouping, threading, and read status
- 📡 **Event-Driven** - Real-time updates via EventEmitter pattern
- 💾 **Storage Abstraction** - Pluggable storage adapters for persistence
- 🔄 **Future-Proof** - Ready for NIP-EE (MLS) when implemented

## Installation

```bash
npm install @nostr-dev-kit/messages
# or
bun add @nostr-dev-kit/messages
```

## Quick Start

```typescript
import NDK from '@nostr-dev-kit/ndk';
import { NDKMessenger } from '@nostr-dev-kit/messages';

// Initialize NDK
const ndk = new NDK({
  explicitRelayUrls: ['wss://relay.damus.io'],
  signer: new NDKPrivateKeySigner(privateKey)
});
await ndk.connect();

// Create messenger
const messenger = new NDKMessenger(ndk);
await messenger.start();

// Send a message
const recipient = ndk.getUser({ npub: "npub1..." });
await messenger.sendMessage(recipient, "Hello!");

// Listen for messages
messenger.on('message', (message) => {
  console.log(`New message from ${message.sender.npub}: ${message.content}`);
});
```

## API Reference

### NDKMessenger

Main orchestrator class for messaging functionality.

```typescript
class NDKMessenger extends EventEmitter {
  constructor(ndk: NDK, options?: MessengerOptions)

  // Start/stop the messenger
  async start(): Promise<void>
  stop(): void

  // Send messages
  async sendMessage(recipient: NDKUser, content: string): Promise<NDKMessage>

  // Manage conversations
  async getConversation(user: NDKUser): Promise<NDKConversation>
  async getConversations(): Promise<NDKConversation[]>

  // Publish relay preferences
  async publishDMRelays(relays: string[]): Promise<NDKEvent>
}
```

#### Events
- `message` - New message received
- `conversation-created` - New conversation started
- `error` - Error occurred

### NDKConversation

Represents a conversation between users with real-time updates.

```typescript
class NDKConversation extends EventEmitter {
  readonly id: string
  readonly participants: NDKUser[]
  readonly protocol: 'nip17' | 'mls'

  // Send messages
  async sendMessage(content: string): Promise<NDKMessage>

  // Get messages
  async getMessages(limit?: number): Promise<NDKMessage[]>

  // Mark as read
  async markAsRead(): Promise<void>

  // Helpers
  getUnreadCount(): number
  getOtherParticipant(): NDKUser | undefined
  getLastMessage(): NDKMessage | undefined
}
```

#### Events
- `message` - New message in conversation
- `state-change` - Conversation state changed
- `error` - Error in conversation

### Storage Adapters

The library uses a storage adapter pattern for flexibility:

```typescript
interface StorageAdapter {
  saveMessage(message: NDKMessage): Promise<void>
  getMessages(conversationId: string, limit?: number): Promise<NDKMessage[]>
  markAsRead(messageIds: string[]): Promise<void>
  getConversations(userId: string): Promise<ConversationMeta[]>
  saveConversation(conversation: ConversationMeta): Promise<void>
}
```

#### Built-in Adapters

- `MemoryAdapter` - In-memory storage (default)
- More adapters coming soon (Dexie, SQLite)

## Examples

### Basic Messaging

```typescript
// Initialize
const messenger = new NDKMessenger(ndk);
await messenger.start();

// Send message
const bob = ndk.getUser({ npub: "npub1bob..." });
await messenger.sendMessage(bob, "Hey Bob!");

// Get conversation
const conversation = await messenger.getConversation(bob);
const messages = await conversation.getMessages();

// Mark as read
await conversation.markAsRead();
```

### Real-time Updates

```typescript
// Listen to all messages
messenger.on('message', (message) => {
  if (message.sender.pubkey !== messenger.myPubkey) {
    showNotification(`New message from ${message.sender.displayName}`);
  }
});

// Listen to specific conversation
conversation.on('message', (message) => {
  updateChatUI(message);
});

conversation.on('error', (error) => {
  console.error('Conversation error:', error);
});
```

### Custom Storage

```typescript
import { MemoryAdapter } from '@nostr-dev-kit/messages';

// Use custom storage
const messenger = new NDKMessenger(ndk, {
  storage: new MemoryAdapter(),
  autoStart: true
});

// Or implement your own
class MyStorageAdapter implements StorageAdapter {
  // ... implement interface methods
}
```

### Cache Module Integration

This package supports NDK's cache module system for persistent storage:

```typescript
import NDKCacheAdapterDexie from '@nostr-dev-kit/cache-dexie';
import { CacheModuleStorage, messagesCacheModule } from '@nostr-dev-kit/messages';

// Use with cache adapter that supports modules
const cacheAdapter = new NDKCacheAdapterDexie({ dbName: 'my-app' });

const ndk = new NDK({
  cacheAdapter,
  // ... other options
});

// Messages will automatically use cache if available
const messenger = new NDKMessenger(ndk, {
  storage: new CacheModuleStorage(cacheAdapter, userPubkey)
});
```

The messages cache module creates these collections:
- `messages` - Individual messages with indexes for efficient querying
- `conversations` - Conversation metadata and participants
- `mlsGroups` - (Future) MLS group state
- `dmRelays` - Relay preferences for DMs

Benefits:
- **Persistent Storage**: Messages survive app restarts (IndexedDB in browser)
- **Automatic Migrations**: Schema upgrades handled automatically
- **Type Safety**: Fully typed collections and queries
- **Performance**: Indexed fields for fast lookups

### Relay Management

```typescript
// Publish your DM relay preferences (kind 10050)
await messenger.publishDMRelays([
  'wss://relay.damus.io',
  'wss://nos.lol'
]);
```

## NIP-17 Implementation

This library implements NIP-17 (Private Direct Messages) with:

- Automatic rumor creation with proper pubkey setting
- Gift wrapping with ephemeral keys
- Relay discovery via kind 10050
- Automatic subscription to kind 1059 events
- Message deduplication

## Future: NIP-EE Support

The library is designed to support NIP-EE (MLS-based messaging) when ready:

```typescript
// Future API (same interface, different protocol)
const conversation = await messenger.createConversation([alice, bob, charlie]);
console.log(conversation.protocol); // 'mls' if all support it, 'nip17' otherwise
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Run tests
bun test

# Run example
cd examples/nip-17-chat
bunx tsx generate-keys.ts
bunx tsx src/index.ts
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT

## See Also

- [NIP-17: Private Direct Messages](https://nips.nostr.com/17)
- [NIP-EE: End-to-End Encrypted Messaging using MLS](https://nips.nostr.com/EE)
- [NDK Documentation](https://ndk.fyi)
- [Example App](./examples/nip-17-chat)