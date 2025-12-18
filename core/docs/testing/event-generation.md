# Event Generation for Testing

This guide shows how to use NDK's test utilities to generate various types of events for testing purposes.

## Basic Event Generation

Use the EventGenerator to create different types of events:

```typescript
import { EventGenerator } from "@nostr-dev-kit/ndk/test";
import { NDK } from "@nostr-dev-kit/ndk";

const ndk = new NDK();
EventGenerator.setNDK(ndk); // Required setup
const generator = new EventGenerator();

// Generate a text note (kind 1)
const textNote = await generator.textNote("Hello World");

// Generate metadata (kind 0)
const metadata = await generator.metadata({
    name: "Test User",
    about: "Testing NDK",
    picture: "https://example.com/avatar.jpg",
});

// Generate contact list (kind 3)
const contacts = await generator.contactList(["pubkey1", "pubkey2", "pubkey3"]);
```

## Advanced Event Generation

### Custom Event Creation

```typescript
// Create a custom event with specific properties
const customEvent = await generator.createEvent({
    kind: 1,
    content: "Custom content",
    tags: [
        ["p", "pubkey1"],
        ["e", "event1"],
    ],
});

// Create an encrypted direct message
const encryptedDM = await generator.encryptedDM("recipient_pubkey", "Secret message");

// Create a reaction event
const reaction = await generator.reaction(
    "target_event_id",
    "+", // Like reaction
);
```

### Event with Tags

```typescript
// Create an event with multiple tag types
const taggedEvent = await generator.createEvent({
    kind: 1,
    content: "Tagged content",
    tags: [
        ["p", "pubkey1", "wss://relay.example"],
        ["e", "event1", "wss://relay.example", "reply"],
        ["t", "testing"],
        ["r", "https://example.com"],
    ],
});
```

### Parametric Events

```typescript
// Generate events with specific parameters
const paramEvent = await generator.createEvent({
    kind: 1,
    content: "Parametric content",
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    pubkey: "custom_pubkey", // Override default pubkey
});

// Generate multiple events
const events = await Promise.all([
    generator.textNote("First note"),
    generator.textNote("Second note"),
    generator.textNote("Third note"),
]);
```

## Testing Scenarios

### Event Verification

```typescript
// Test event verification
const event = await generator.textNote("Test message");

expect(event.kind).toBe(1);
expect(event.content).toBe("Test message");
expect(event.sig).toBeDefined();
expect(event.id).toBeDefined();
expect(event.pubkey).toBeDefined();
```

### Event Relationships

```typescript
// Create a thread of related events
const rootEvent = await generator.textNote("Root message");
const replyEvent = await generator.createEvent({
    kind: 1,
    content: "Reply message",
    tags: [
        ["e", rootEvent.id, "", "root"],
        ["p", rootEvent.pubkey],
    ],
});

// Create a reaction to the reply
const reactionEvent = await generator.reaction(replyEvent.id, "+");
```

### Testing Event Processing

```typescript
// Test event processing with mock relay
import { RelayMock } from "@nostr-dev-kit/ndk/test";

const relay = new RelayMock("wss://test.relay");
const events = [];

// Subscribe to events
relay.subscribe({
    subId: "test",
    filters: [{ kinds: [1] }],
    eventReceived: (event) => events.push(event),
});

// Generate and simulate events
const event1 = await generator.textNote("First");
const event2 = await generator.textNote("Second");

await relay.simulateEvent(event1);
await relay.simulateEvent(event2);

expect(events).toHaveLength(2);
```

## Best Practices

1. Reset generator before tests:

```typescript
beforeEach(() => {
    EventGenerator.setNDK(new NDK());
});
```

2. Use consistent timestamps for deterministic testing:

```typescript
const timestamp = Math.floor(Date.now() / 1000);
const event = await generator.createEvent({
    kind: 1,
    content: "Test",
    created_at: timestamp,
});
```

3. Test event validation:

```typescript
const event = await generator.textNote("Test");
expect(event.verify()).resolves.toBe(true);
```

4. Generate related events:

```typescript
// Create a conversation thread
const thread = [];
const root = await generator.textNote("Root");
thread.push(root);

for (let i = 0; i < 3; i++) {
    const reply = await generator.createEvent({
        kind: 1,
        content: `Reply ${i + 1}`,
        tags: [
            ["e", thread[i].id, "", "reply"],
            ["p", thread[i].pubkey],
        ],
    });
    thread.push(reply);
}
```
