# Testing Your Nostr Application

NDK provides comprehensive testing infrastructure to help you test your Nostr applications without needing real relays or live network connections.

## Overview

The `@nostr-dev-kit/ndk/test` package exports a full suite of testing utilities including:

- **Mock Relays** - Simulate Nostr relays with configurable behavior
- **Test Users** - Deterministic users for reproducible tests
- **Event Generators** - Create test events easily
- **Time Control** - Test time-dependent operations
- **Cashu Mocking** - Test nutzaps and Cashu tokens

## Installation

The testing utilities are included with NDK:

```bash
npm install @nostr-dev-kit/ndk
```

## Quick Start

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NDK } from "@nostr-dev-kit/ndk";
import {
  RelayPoolMock,
  UserGenerator,
  EventGenerator
} from "@nostr-dev-kit/ndk/test";

describe("My Nostr App Feature", () => {
  let ndk: NDK;
  let pool: RelayPoolMock;

  beforeEach(() => {
    // Create mock relay pool
    pool = new RelayPoolMock();

    // Initialize NDK with mock pool
    ndk = new NDK({ explicitRelayUrls: [] });
    ndk.pool = pool;

    // Add mock relays
    pool.addMockRelay("wss://relay.example.com");

    // Configure EventGenerator
    EventGenerator.setNDK(ndk);
  });

  afterEach(() => {
    pool.disconnectAll();
    pool.resetAll();
  });

  it("should receive events from relay", async () => {
    const relay = pool.getMockRelay("wss://relay.example.com");
    const alice = await UserGenerator.getUser("alice", ndk);

    // Create test event
    const event = await EventGenerator.createSignedTextNote(
      "Hello, Nostr!",
      alice.pubkey
    );

    // Subscribe to events in your app
    const sub = ndk.subscribe({ kinds: [1], limit: 1 });

    // Simulate relay sending the event
    relay.simulateEvent(event);

    // Verify your app received it
    const events = await new Promise((resolve) => {
      const received: any[] = [];
      sub.on("event", (e) => received.push(e));
      sub.on("eose", () => resolve(received));
      relay.simulateEOSE();
    });

    expect(events).toHaveLength(1);
    expect(events[0].content).toBe("Hello, Nostr!");
  });
});
```

## Core Testing Utilities

### RelayMock

Mock a single Nostr relay with configurable behavior:

```typescript
import { RelayMock } from '@nostr-dev-kit/ndk/test';

const relay = new RelayMock('wss://relay.example.com', {
  connectionDelay: 100,      // Simulate 100ms connection delay
  simulateDisconnect: true,  // Randomly disconnect
  disconnectAfter: 5000      // Disconnect after 5 seconds
});

// Simulate events from relay
relay.simulateEvent(event);
relay.simulateEOSE();

// Test publish failures
relay.failNextPublish = true;
```

[Learn more about RelayMock →](./relay-mock)

### RelayPoolMock

Manage multiple mock relays for testing multi-relay scenarios:

```typescript
import { RelayPoolMock } from '@nostr-dev-kit/ndk/test';

const pool = new RelayPoolMock();
pool.addMockRelay('wss://relay1.example.com');
pool.addMockRelay('wss://relay2.example.com');

// Simulate event on all relays
pool.simulateEventOnAll(event);

// Simulate event on specific relays
pool.simulateEventOn(['wss://relay1.example.com'], event);
```

[Learn more about RelayPoolMock →](./relay-pool-mock)

### UserGenerator

Generate deterministic test users with predefined keypairs:

```typescript
import { UserGenerator } from '@nostr-dev-kit/ndk/test';

// Get predefined users (alice, bob, carol, dave, eve)
const alice = await UserGenerator.getUser('alice', ndk);
const bob = await UserGenerator.getUser('bob', ndk);

// Always the same pubkeys - perfect for reproducible tests!
```

[Learn more about UserGenerator →](./user-generator)

### EventGenerator

Create test events for your application:

```typescript
import { EventGenerator } from '@nostr-dev-kit/ndk/test';

// Must be called once before using EventGenerator
EventGenerator.setNDK(ndk);

// Create signed text note
const note = await EventGenerator.createSignedTextNote('Hello!', alice.pubkey);

// Create encrypted DM
const dm = await EventGenerator.createEncryptedDirectMessage(
  'Secret message',
  alice.pubkey,
  bob.pubkey
);

// Create repost
const repost = await EventGenerator.createRepost(originalEvent, alice.pubkey);
```

[Learn more about EventGenerator →](./event-generator)

### TestEventFactory

High-level event creation with proper relationships and tagging:

```typescript
import { TestEventFactory } from '@nostr-dev-kit/ndk/test';

const factory = new TestEventFactory(ndk);

// Create a note
const note = await factory.createSignedTextNote('Hello!', alice);

// Create a reply with proper NIP-10 tagging
const reply = await factory.createReply(note, 'Hi back!', bob);

// Create a DM
const dm = await factory.createDirectMessage('Secret', alice, bob);

// Create a conversation thread
const thread = await factory.createEventChain('Original post', alice, [
  { author: bob, content: 'First reply' },
  { author: carol, content: 'Second reply' }
]);
```

[Learn more about TestEventFactory →](./test-event-factory)

### TimeController

Control time in tests for testing time-dependent features:

```typescript
import { vi } from 'vitest';
import { TimeController } from '@nostr-dev-kit/ndk/test';

beforeEach(() => {
  vi.useFakeTimers();
  TimeController.setViObject(vi);
});

it('should retry after delay', async () => {
  const promise = myApp.retryPublish(event); // retries after 5 seconds

  // Advance time by 5 seconds
  await TimeController.tickAsync(5000);

  await expect(promise).resolves.toBeTruthy();
});
```

[Learn more about TimeController →](./time-controller)

### Cashu/Nutzap Mocking

Test Cashu tokens and nutzaps without real mints:

```typescript
import { mockNutzap, mockProof } from '@nostr-dev-kit/ndk/test';

// Create a nutzap
const nutzap = await mockNutzap(
  'https://mint.example.com',
  1000, // 1000 sats
  ndk,
  {
    recipientPubkey: bob.pubkey,
    content: 'Great post!',
    eventId: originalEvent.id
  }
);

// Create individual proof
const proof = mockProof('https://mint.example.com', 100);
```

[Learn more about Cashu Testing →](./cashu-testing)

## Testing Patterns

### Testing Event Subscriptions

```typescript
it("should handle subscription events", async () => {
  const relay = pool.getMockRelay("wss://relay.example.com");

  // Your app code that creates subscription
  const sub = ndk.subscribe({ kinds: [1], limit: 10 });

  const receivedEvents: NDKEvent[] = [];
  sub.on("event", (event) => receivedEvents.push(event));

  // Simulate events from relay
  const event1 = await EventGenerator.createSignedTextNote("Event 1", alice.pubkey);
  const event2 = await EventGenerator.createSignedTextNote("Event 2", bob.pubkey);

  relay.simulateEvent(event1);
  relay.simulateEvent(event2);
  relay.simulateEOSE();

  await new Promise(resolve => sub.on("eose", resolve));

  expect(receivedEvents).toHaveLength(2);
});
```

### Testing Event Publishing

```typescript
it("should publish events successfully", async () => {
  const relay = pool.getMockRelay("wss://relay.example.com");
  const alice = await UserGenerator.getUser("alice", ndk);

  ndk.signer = SignerGenerator.getSigner("alice");

  // Your app code that publishes event
  const event = new NDKEvent(ndk);
  event.kind = 1;
  event.content = "Hello from my app!";

  await event.publish();

  // Verify event was sent to relay
  expect(relay.validatedEvents).toHaveLength(1);
  expect(relay.validatedEvents[0].content).toBe("Hello from my app!");
});
```

### Testing Network Failures

```typescript
it("should handle relay disconnections", async () => {
  const relay = new RelayMock("wss://relay.example.com", {
    simulateDisconnect: true,
    disconnectAfter: 1000
  });

  pool.addRelay(relay);

  // Test your app's reconnection logic
  await relay.connect();

  // Wait for disconnect
  await new Promise(resolve => setTimeout(resolve, 1500));

  expect(relay.status).not.toBe(NDKRelayStatus.CONNECTED);
});
```

## Best Practices

### 1. Clean Up After Each Test

```typescript
afterEach(() => {
  pool.disconnectAll();
  pool.resetAll();
  vi.clearAllTimers();
});
```

### 2. Use Deterministic Test Users

```typescript
// ✅ Good: Deterministic, reproducible
const alice = await UserGenerator.getUser("alice", ndk);

// ❌ Avoid: Random users make tests flaky
const randomUser = await UserGenerator.getRandomUser(ndk);
```

### 3. Initialize EventGenerator Early

```typescript
beforeEach(() => {
  ndk = new NDK({ explicitRelayUrls: [] });
  EventGenerator.setNDK(ndk); // Do this before creating events
});
```

### 4. Test Both Success and Failure Paths

```typescript
it("should handle successful publish", async () => {
  // Test success case
});

it("should handle failed publish", async () => {
  relay.failNextPublish = true;
  // Test failure case
});
```

## Next Steps

- [RelayMock API Reference](./relay-mock)
- [RelayPoolMock API Reference](./relay-pool-mock)
- [UserGenerator API Reference](./user-generator)
- [EventGenerator API Reference](./event-generator)
- [Testing Patterns & Examples](./patterns)

## Need Help?

If you encounter issues or have questions:
- [GitHub Issues](https://github.com/nostr-dev-kit/ndk/issues)
- [NDK Documentation](/)
