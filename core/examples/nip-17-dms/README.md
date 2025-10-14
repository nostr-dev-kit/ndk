# NIP-17 Private Direct Messages Example

A complete, working implementation of [NIP-17](https://nips.nostr.com/17) (Private Direct Messages) using NDK's gift-wrapping functionality.

## What is NIP-17?

NIP-17 defines a protocol for private direct messages on Nostr that provides better privacy than legacy NIP-04 encrypted DMs. It uses a nested encryption approach called "gift wrapping" that hides metadata and prevents correlation attacks.

### How Gift Wrapping Works

NIP-17 uses three layers:

1. **Rumor (kind 14)** - The actual message content, unsigned
   - Contains the message text and recipient's pubkey
   - Never published directly to relays
   - Sender's pubkey is included but the event is not signed

2. **Seal (kind 13)** - First encryption layer
   - The rumor is JSON-stringified and encrypted using NIP-44
   - Signed by the sender's real key
   - Encrypted to the recipient's pubkey
   - Has a randomized `created_at` (within ~2 days)

3. **Gift Wrap (kind 1059)** - Second encryption layer
   - The seal is JSON-stringified and encrypted using NIP-44
   - Signed by a **random ephemeral key** (generated per message)
   - Encrypted to the recipient's pubkey
   - Has a randomized `created_at` (within ~2 days)
   - Tagged with recipient's pubkey (`["p", "<recipient-pubkey>"]`)

The randomized timestamps and ephemeral keys make it very difficult to correlate messages or identify communication patterns.

## Features

- ✅ Send NIP-17 direct messages using NDK's `giftWrap()`
- ✅ Receive and decrypt messages using NDK's `giftUnwrap()`
- ✅ Conversation tracking with read/unread status
- ✅ Bi-directional messaging between two identities
- ✅ Publish DM relay lists (kind 10050)
- ✅ Real-time message listening via subscriptions
- ✅ Local conversation storage (JSON file)

## Installation

```bash
# From the NDK monorepo root
bun install

# Or install dependencies directly in this directory
cd core/examples/nip-17-dms
bun install
```

## Usage

### Generate Test Keys

```bash
bunx tsx generate-keys.ts
```

This will output two test identities (Alice and Bob) with their nsec/npub pairs and example commands.

### Send a Message

```bash
bunx tsx src/index.ts send <your-nsec> <recipient-npub> "<message>"
```

Example:
```bash
bunx tsx src/index.ts send nsec1... npub1... "Hello!"
```

### List Conversations

```bash
bunx tsx src/index.ts list <your-nsec>
```

Shows all conversations with unread counts and message previews.

### Read a Conversation

```bash
bunx tsx src/index.ts read <your-nsec> <other-user-npub>
```

Displays the full conversation thread and marks messages as read.

### Listen for Incoming Messages

```bash
bunx tsx src/index.ts listen <your-nsec> [seconds]
```

Subscribes to incoming DMs and displays them in real-time. Default duration is 30 seconds.

Example:
```bash
bunx tsx src/index.ts listen nsec1... 60
```

### Publish DM Relay List (kind 10050)

```bash
bunx tsx src/index.ts relay-list <your-nsec> <relay-urls...>
```

Example:
```bash
bunx tsx src/index.ts relay-list nsec1... wss://relay.damus.io wss://nos.lol
```

## Testing the Full Flow

```bash
# 1. Generate test keys
bunx tsx generate-keys.ts

# 2. Send a message from Alice to Bob
bunx tsx src/index.ts send <alice-nsec> <bob-npub> "Hello Bob!"

# 3. Bob listens for messages
bunx tsx src/index.ts listen <bob-nsec> 30

# 4. Bob reads the conversation
bunx tsx src/index.ts read <bob-nsec> <alice-npub>

# 5. Bob replies
bunx tsx src/index.ts send <bob-nsec> <alice-npub> "Hey Alice!"

# 6. Alice listens for the reply
bunx tsx src/index.ts listen <alice-nsec> 30

# 7. Alice reads the full conversation
bunx tsx src/index.ts read <alice-nsec> <bob-npub>
```

## Architecture

### File Structure

```
src/
├── index.ts          # CLI entry point with command routing
├── dm-manager.ts     # Core NIP-17 logic (send, receive, subscribe)
└── storage.ts        # Local conversation storage
```

### Key Components

#### `DMManager` (dm-manager.ts)

Handles all NIP-17 operations:

- **`sendDM(recipient, message)`** - Creates a rumor, gift wraps it, and publishes
- **`subscribeToDMs(onMessage)`** - Subscribes to kind 1059 events and unwraps them
- **`getConversations()`** - Retrieves all conversations for the current user
- **`publishDMRelayList(relays)`** - Publishes a kind 10050 relay list

#### `ConversationStorage` (storage.ts)

Simple file-based storage using JSON:

- Stores decrypted messages with metadata
- Groups messages into conversations
- Tracks read/unread status
- Deduplicates messages by ID

## Using NDK for NIP-17

### Sending a Message

```typescript
import { NDKEvent, NDKKind, NDKRelaySet, giftWrap } from "@nostr-dev-kit/ndk";

// 1. Create the rumor (kind 14)
const rumor = new NDKEvent(ndk);
rumor.kind = NDKKind.PrivateDirectMessage; // 14
rumor.content = "Your message here";
rumor.pubkey = sender.pubkey;
rumor.created_at = Math.floor(Date.now() / 1000);
rumor.tags = [["p", recipient.pubkey]];

// 2. Gift wrap the rumor
const wrappedEvent = await giftWrap(rumor, recipient, ndk.signer);

// 3. Get recipient's DM relays (kind 10050)
const dmRelays = await getRecipientDMRelays(recipient);

// 4. Create relay set and publish
const relaySet = NDKRelaySet.fromRelayUrls(dmRelays, ndk);
await wrappedEvent.publish(relaySet);
```

### Receiving Messages

```typescript
import { NDKKind, giftUnwrap } from "@nostr-dev-kit/ndk";

// 1. Subscribe to gift wraps tagged with your pubkey
const sub = ndk.subscribe({
    kinds: [NDKKind.GiftWrap], // 1059
    "#p": [myPubkey],
}, { closeOnEose: false });

// 2. Unwrap incoming events
sub.on("event", async (wrappedEvent) => {
    const rumor = await giftUnwrap(wrappedEvent, undefined, ndk.signer);

    if (rumor.kind === NDKKind.PrivateDirectMessage) {
        console.log("Message:", rumor.content);
        console.log("From:", rumor.pubkey);
    }
});
```

## Important Findings

### ✅ What Works Well

1. **NDK's `giftWrap()` and `giftUnwrap()` are excellent**
   - Handle all the complexity of NIP-59 gift wrapping
   - Proper NIP-44 encryption
   - Automatic seal creation and signing
   - Randomized timestamps for privacy

2. **Gift wrapping is straightforward**
   - Just create a rumor event and call `giftWrap()`
   - No need to manually handle seals or ephemeral keys
   - NDK takes care of all the nested encryption

3. **Subscription model works perfectly**
   - Subscribe to kind 1059 with `#p` filter
   - Real-time message reception
   - Easy to unwrap and process

### ✅ NDK Improvements Made

During this implementation, we improved NDK's NIP-17 support:

1. **Auto-set pubkey in `giftWrap()`** ✅
   ```typescript
   // ✅ Now works automatically:
   const rumor = new NDKEvent(ndk);
   rumor.kind = 14;
   rumor.content = "message";
   await giftWrap(rumor, recipient, signer); // pubkey auto-set!
   ```

2. **AI Guardrails for common mistakes** ✅
   - Runtime warning if rumor is signed
   - JSDoc documentation of common pitfalls
   - Clear guidance on NIP-17 best practices

3. **Relay targeting works great** ✅
   - Use `NDKRelaySet.fromRelayUrls()` + `event.publish(relaySet)`
   - Example properly publishes to BOTH sender and recipient relays per NIP-17

### 🔍 Remaining DX Opportunities

1. **No conversation primitives**
   - Need to manually track conversations by grouping messages
   - Need to manually handle read/unread status
   - Sorting by `created_at` requires careful handling (rumor time, not wrapper time)

   **Possible solutions**:
   - `NDKConversation` class
   - `ndk.subscribeToDMs()` helper
   - Consider `@nostr-dev-kit/messages` package for high-level primitives

2. **Kind 10050 relay discovery is manual**
   - Every client must implement ~40 lines of relay lookup logic
   - Fetch kind 10050 → fallback to 10002 → fallback to connected relays

   **Suggested**: Add `user.getDMRelays()` helper to NDKUser

3. **Rumor ID not exposed by `giftWrap()`**
   - Applications need the rumor ID for storage/deduplication
   - Currently must compute manually using `getEventHash()`

   **Suggested**: Return both wrapped event and rumor from `giftWrap()`

## NIP-17 Best Practices

### 1. Use Kind 10050 for Relay Discovery

Always check the recipient's DM relay list (kind 10050) before sending:

```typescript
const dmRelays = await ndk.fetchEvent({
    kinds: [NDKKind.DirectMessageReceiveRelayList],
    authors: [recipient.pubkey],
});
```

### 2. Keep Relay Lists Small

Per NIP-17, users should list only 1-3 relays in their kind 10050 to reduce metadata leakage.

### 3. Store the Rumor, Not the Wrapper

When storing messages locally, store the unwrapped rumor event:
- Use rumor's `created_at` for message ordering
- Use rumor's `pubkey` for sender identification
- The wrapper's timestamp is randomized and meaningless

### 4. Handle Subscription Carefully

Keep the subscription open for real-time messages:

```typescript
ndk.subscribe(
    { kinds: [1059], "#p": [myPubkey] },
    { closeOnEose: false } // Important!
);
```

### 5. Deduplicate Messages

Since messages can arrive from multiple relays, always deduplicate by rumor `id`.

## Comparison with Legacy NIP-04

| Feature | NIP-04 (kind 4) | NIP-17 (kind 14) |
|---------|----------------|------------------|
| **Encryption** | NIP-04 | NIP-44 (stronger) |
| **Metadata** | Sender visible | Sender hidden (ephemeral key) |
| **Timestamps** | Real timestamp | Randomized (privacy) |
| **Correlation** | Easy to track | Very difficult |
| **Group DMs** | Difficult | Not supported |
| **Relay hints** | No standard | Kind 10050 |

## Storage Considerations

This example uses simple JSON file storage, but production apps should use:

- **SQLite** - For better performance and querying
- **IndexedDB** - For web apps
- **Encrypted storage** - For sensitive conversations
- **NDK cache adapters** - For integration with NDK's caching

Example with NDK cache:

```typescript
// Use NDK's cache for decrypted events
if (ndk.cacheAdapter?.addDecryptedEvent) {
    ndk.cacheAdapter.addDecryptedEvent(rumorEvent);
}
```

## Performance Notes

- Gift wrapping is computationally expensive (2x encryption + signing)
- Unwrapping requires decryption and signature verification
- Consider rate limiting or batching for high-volume scenarios
- The randomized timestamps mean you can't sort by wrapper `created_at`

## Security Notes

⚠️ **Important Security Considerations:**

1. **No Forward Secrecy** - If your private key is compromised, all past messages can be decrypted
2. **No Deniability** - The seal is signed, proving you sent the message
3. **Trust the Recipient** - Recipient can prove you sent a message by sharing the seal
4. **Relay Trust** - Relays can see who you're messaging (p-tag on wrapper)
5. **Metadata Correlation** - Multiple messages sent in quick succession may still be correlatable

For higher security requirements, consider:
- Using MLS (Messaging Layer Security) when available
- Implementing your own forward secrecy layer
- Using Tor or VPNs to hide IP addresses

## Resources

- [NIP-17: Private Direct Messages](https://nips.nostr.com/17)
- [NIP-44: Encrypted Payloads](https://nips.nostr.com/44)
- [NIP-59: Gift Wrap](https://nips.nostr.com/59)
- [NDK Documentation](https://ndk.fyi)

## License

MIT
