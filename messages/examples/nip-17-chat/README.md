# NIP-17 Chat Example using @nostr-dev-kit/messages

A complete example demonstrating the new high-level messaging API from `@nostr-dev-kit/messages` that simplifies NIP-17 private direct message implementation.

## What's Different from the Core Example?

This example uses the new `@nostr-dev-kit/messages` package instead of implementing NIP-17 manually:

### Old Way (core/examples/nip-17-dms)
```typescript
// Manual rumor creation
const rumor = new NDKEvent(ndk);
rumor.kind = 14;
rumor.content = message;
rumor.pubkey = sender.pubkey; // Must manually set
rumor.tags = [["p", recipient.pubkey]];

// Manual gift wrapping
const wrapped = await giftWrap(rumor, recipient, signer);

// Manual relay management
const relays = await getRecipientDMRelays(recipient);
const relaySet = NDKRelaySet.fromRelayUrls(relays, ndk);
await wrapped.publish(relaySet);
```

### New Way (this example)
```typescript
// Simple one-liner
await messenger.sendMessage(recipient, "Hello!");

// Or with conversation context
const conversation = await messenger.getConversation(recipient);
await conversation.sendMessage("Hello!");
```

## Key Features

- ✨ **Simple API**: One-line message sending
- 💬 **Conversation Management**: Automatic grouping and threading
- 📡 **Event-Driven**: Real-time updates via EventEmitter
- 💾 **Storage Abstraction**: Pluggable storage adapters
- 🔄 **Automatic Relay Discovery**: Handles kind 10050 relay lists
- 🎯 **Protocol Abstraction**: Same API for future MLS support

## Installation

From the monorepo root:

```bash
# Install dependencies
bun install

# Build the messages package
cd messages && bun run build && cd ..

# Navigate to example
cd messages/examples/nip-17-chat
```

## Usage

### Generate Test Keys

```bash
bunx tsx generate-keys.ts
```

This creates two test identities (Alice and Bob) with their nsec/npub pairs.

### Send a Message

```bash
bunx tsx src/index.ts send <your-nsec> <recipient-npub> "Your message"
```

### List Conversations

```bash
bunx tsx src/index.ts list <your-nsec>
```

Shows all conversations with unread counts and message previews.

### Read a Conversation

```bash
bunx tsx src/index.ts read <your-nsec> <other-npub>
```

Displays the full conversation and marks messages as read.

### Listen for Messages

```bash
bunx tsx src/index.ts listen <your-nsec> [duration-seconds]
```

Real-time subscription to incoming messages (default: 30 seconds).

### Publish DM Relay List

```bash
bunx tsx src/index.ts relay-list <your-nsec> wss://relay1.com wss://relay2.com
```

Publishes your preferred DM relays (kind 10050).

## Example Flow

```bash
# 1. Generate keys
bunx tsx generate-keys.ts

# 2. Alice sends a message to Bob
bunx tsx src/index.ts send <alice-nsec> <bob-npub> "Hey Bob! Using the new messaging API!"

# 3. Bob listens for messages
bunx tsx src/index.ts listen <bob-nsec>

# 4. Bob reads the conversation
bunx tsx src/index.ts read <bob-nsec> <alice-npub>

# 5. Bob replies
bunx tsx src/index.ts send <bob-nsec> <alice-npub> "Hi Alice! This API is so much cleaner!"

# 6. Alice checks her conversations
bunx tsx src/index.ts list <alice-nsec>
```

## Architecture Comparison

### Core Example Structure
```
core/examples/nip-17-dms/
├── dm-manager.ts      # 300 lines - Manual NIP-17 implementation
├── storage.ts         # 100 lines - Custom storage
└── index.ts           # 400 lines - CLI with all logic
```

### This Example Structure
```
messages/examples/nip-17-chat/
├── file-storage.ts    # 100 lines - Storage adapter implementation
└── index.ts           # 300 lines - Clean CLI using the library
```

The new library handles:
- Gift wrapping complexity
- Relay discovery and management
- Subscription handling
- Message deduplication
- Conversation grouping
- Event emissions

## Event-Driven Updates

The new API is fully event-driven:

```typescript
// Global messenger events
messenger.on('message', (message) => {
    console.log('New message:', message);
});

messenger.on('conversation-created', (conversation) => {
    console.log('New conversation started');
});

// Conversation-specific events
conversation.on('message', (message) => {
    updateUI(message);
});

conversation.on('error', (error) => {
    showError(error);
});
```

## Storage Adapters

This example uses a file-based storage adapter, but you can easily swap it:

```typescript
import { MemoryAdapter } from '@nostr-dev-kit/messages/storage';

// Use in-memory storage (no persistence)
const messenger = new NDKMessenger(ndk, {
    storage: new MemoryAdapter()
});

// Or implement your own (SQLite, IndexedDB, etc.)
class MyCustomAdapter implements StorageAdapter {
    // ... implementation
}
```

## Benefits of the New API

1. **Simplicity**: Focus on your app logic, not protocol details
2. **Maintainability**: Updates to NIP-17 happen in the library
3. **Consistency**: Same patterns across all NDK packages
4. **Future-Proof**: Ready for MLS when NIP-EE is implemented
5. **Type Safety**: Full TypeScript with strict types
6. **Testing**: Easier to mock and test high-level APIs

## Next Steps

- The library will soon support NIP-EE (MLS-based messaging)
- Same API will work for both protocols
- Automatic protocol selection based on recipient capabilities
- Group messaging support coming with MLS

## License

MIT