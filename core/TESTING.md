# Testing Your Nostr Application with NDK

NDK provides a comprehensive testing infrastructure to help you test your Nostr applications without needing real relays or live network connections. This guide covers everything you need to know about using NDK's testing utilities in your own application tests.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Quick Start](#quick-start)
- [Core Testing Utilities](#core-testing-utilities)
  - [RelayMock](#relaymock)
  - [RelayPoolMock](#relaypoolmock)
  - [UserGenerator](#usergenerator)
  - [EventGenerator](#eventgenerator)
  - [TestEventFactory](#testeventfactory)
  - [TestFixture](#testfixture)
  - [TimeController](#timecontroller)
  - [Cashu/Nutzap Testing](#cashunutzap-testing)
- [Testing Patterns](#testing-patterns)
- [Best Practices](#best-practices)

## Installation & Setup

### 1. Install NDK

```bash
npm install @nostr-dev-kit/ndk
# or
yarn add @nostr-dev-kit/ndk
# or
pnpm add @nostr-dev-kit/ndk
```

### 2. Install Test Framework

NDK testing utilities work with any test framework. We recommend Vitest:

```bash
npm install -D vitest
```

### 3. Import Testing Utilities

```typescript
import {
  RelayMock,
  RelayPoolMock,
  UserGenerator,
  EventGenerator,
  TestEventFactory,
  TestFixture,
  TimeController
} from "@nostr-dev-kit/ndk/test";
```

## Quick Start

Here's a minimal example of testing a Nostr application feature:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NDK } from "@nostr-dev-kit/ndk";
import { RelayPoolMock, UserGenerator, EventGenerator } from "@nostr-dev-kit/ndk/test";

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
    const alice = UserGenerator.getUser("alice", ndk);

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

`RelayMock` simulates a single Nostr relay with full control over its behavior.

#### Creating a Mock Relay

```typescript
import { RelayMock } from "@nostr-dev-kit/ndk/test";

const relay = new RelayMock("wss://relay.example.com", {
  // Simulate random disconnects
  simulateDisconnect: false,

  // Disconnect after X ms
  disconnectAfter: undefined,

  // Simulate connection delay (ms)
  connectionDelay: 0,

  // Auto-connect on instantiation
  autoConnect: true,

  // Force next publish to fail
  failNextPublish: false
});
```

#### Lifecycle Methods

```typescript
// Connect/disconnect
await relay.connect();
await relay.disconnect();

// Check connection status
relay.status; // NDKRelayStatus enum
```

#### Simulating Events

```typescript
// Send an event to all subscriptions
relay.simulateEvent(event);

// Send event to specific subscription
relay.simulateEvent(event, subscriptionId);

// Send EOSE (End of Stored Events)
relay.simulateEOSE(subscriptionId);

// Send NOTICE message
relay.simulateNotice("Rate limit exceeded");

// Send raw message
relay.simulateReceiveMessage('["EVENT", "subId", {...}]');
```

#### Publishing & Validation

```typescript
// Publish event (returns OK response)
const result = await relay.publish(event);

// Control event validation
relay.shouldValidateEvent(); // returns boolean

// Access validated/non-validated events
relay.validatedEvents; // Event[]
relay.nonValidatedEvents; // Event[]
```

#### Subscription Management

```typescript
// Subscribe to filters
relay.subscribe(subscription, filters);

// Access active subscriptions
relay.subscriptions; // Map<string, NDKSubscription>
```

#### Tracking & Debugging

```typescript
// View all messages sent to relay
relay.messageLog; // string[]

// Reset relay state
relay.reset();
```

### RelayPoolMock

`RelayPoolMock` manages multiple mock relays for testing multi-relay scenarios.

#### Setup

```typescript
import { RelayPoolMock } from "@nostr-dev-kit/ndk/test";

const pool = new RelayPoolMock();

// Add relays
pool.addMockRelay("wss://relay1.example.com");
pool.addMockRelay("wss://relay2.example.com", {
  connectionDelay: 100,
  simulateDisconnect: true
});

// Get specific relay
const relay1 = pool.getMockRelay("wss://relay1.example.com");
```

#### Multi-Relay Operations

```typescript
// Simulate event on all relays
pool.simulateEventOnAll(event);

// Simulate event on specific relays
pool.simulateEventOn(
  ["wss://relay1.example.com", "wss://relay2.example.com"],
  event
);

// Send EOSE to all relays
pool.simulateEOSEOnAll(subscriptionId);

// Disconnect all relays
pool.disconnectAll();

// Reset all relays
pool.resetAll();
```

#### Event Listeners

```typescript
// Listen to pool events
pool.on("relay:connect", (relay) => {
  console.log("Relay connected:", relay.url);
});

pool.on("relay:disconnect", (relay) => {
  console.log("Relay disconnected:", relay.url);
});

// Remove listener
pool.off("relay:connect", handler);

// One-time listener
pool.once("relay:connect", handler);
```

### UserGenerator

`UserGenerator` provides deterministic test users with pre-generated keypairs.

#### Predefined Test Users

```typescript
import { UserGenerator } from "@nostr-dev-kit/ndk/test";

// Get predefined users (alice, bob, carol, dave, eve)
const alice = UserGenerator.getUser("alice", ndk);
const bob = UserGenerator.getUser("bob", ndk);

// Get just the private key
const alicePrivkey = UserGenerator.getPrivateKey("alice");
```

#### Random Users

```typescript
// Generate random user
const randomUser = UserGenerator.getRandomUser(ndk);
```

#### Signers

```typescript
import { SignerGenerator } from "@nostr-dev-kit/ndk/test";

// Get signer for test user
const aliceSigner = SignerGenerator.getSigner("alice");

// Set signer on NDK instance
ndk.signer = aliceSigner;

// Sign an event
const signedEvent = await SignerGenerator.sign(event, alice);

// Random signer
const randomSigner = SignerGenerator.getRandomSigner();
```

### EventGenerator

`EventGenerator` creates Nostr events for testing your app's event handling.

#### Setup

```typescript
import { EventGenerator } from "@nostr-dev-kit/ndk/test";

// Must be called once before using EventGenerator
EventGenerator.setNDK(ndk);
```

#### Creating Events

```typescript
// Create unsigned event
const event = EventGenerator.createEvent(
  1,                    // kind
  "Hello, world!",      // content
  alicePubkey          // author pubkey
);

// Create signed text note (kind 1)
const note = await EventGenerator.createSignedTextNote(
  "This is a note",
  alicePubkey
);

// Create encrypted DM (kind 4)
const dm = await EventGenerator.createEncryptedDirectMessage(
  "Secret message",
  alicePubkey,    // from
  bobPubkey       // to
);

// Create repost (kind 6)
const repost = await EventGenerator.createRepost(
  originalEvent,
  alicePubkey
);

// Create parameterized replaceable event
const replaceable = await EventGenerator.createParameterizedReplaceable(
  30023,              // kind
  "Article content",  // content
  alicePubkey,       // author
  "my-article"       // d tag
);
```

### TestEventFactory

`TestEventFactory` provides higher-level event creation with proper relationships and tagging.

#### Setup

```typescript
import { TestEventFactory } from "@nostr-dev-kit/ndk/test";

const factory = new TestEventFactory(ndk);
```

#### Creating Events

```typescript
// Create signed text note
const note = await factory.createSignedTextNote(
  "Hello!",
  alice,
  1  // optional: kind (defaults to 1)
);

// Create DM between users
const dm = await factory.createDirectMessage(
  "Secret message",
  alice,  // from
  bob     // to
);

// Create reply to event
const reply = await factory.createReply(
  originalEvent,
  "Great post!",
  bob,
  1  // optional: kind (defaults to 1)
);

// Create conversation thread
const thread = await factory.createEventChain(
  "Original post",
  alice,
  [
    { author: bob, content: "First reply" },
    { author: carol, content: "Second reply" },
    { author: alice, content: "Reply to replies" }
  ]
);
```

### TestFixture

`TestFixture` provides a complete test environment with NDK, users, and event factory pre-configured.

#### Setup

```typescript
import { TestFixture } from "@nostr-dev-kit/ndk/test";

const fixture = new TestFixture();

// Access NDK instance
fixture.ndk;

// Access event factory
fixture.eventFactory;

// Get test user
const alice = fixture.getUser("alice");

// Get signer
const aliceSigner = fixture.getSigner("alice");

// Setup signer on NDK
fixture.setupSigner("alice");
```

### TimeController

`TimeController` manages time-based operations in tests (timers, delays, async operations).

#### Setup

```typescript
import { vi } from "vitest";
import { TimeController, withTimeControl } from "@nostr-dev-kit/ndk/test";

// Option 1: Manual setup
const timeController = new TimeController();
timeController.setViObject(vi);

// Option 2: Use helper function
const timeController = withTimeControl(vi);
```

#### Controlling Time

```typescript
// Advance timers synchronously
timeController.advanceTime(1000); // advance 1 second

// Advance timers asynchronously
await timeController.tickAsync(5000); // advance 5 seconds

// Wait for next event loop tick
await timeController.waitForNextTick();

// Reset all timers
timeController.reset();
```

#### Usage Example

```typescript
import { vi, describe, it, beforeEach } from "vitest";
import { withTimeControl } from "@nostr-dev-kit/ndk/test";

describe("Time-dependent feature", () => {
  let timeController;

  beforeEach(() => {
    vi.useFakeTimers();
    timeController = withTimeControl(vi);
  });

  it("should retry after delay", async () => {
    const promise = myAsyncFunction(); // function that waits 5 seconds

    await timeController.tickAsync(5000);

    await expect(promise).resolves.toBe(expectedValue);
  });
});
```

### Cashu/Nutzap Testing

Test Cashu tokens and nutzaps in your application.

#### Creating Mock Nutzaps

```typescript
import { mockNutzap, mockProof } from "@nostr-dev-kit/ndk/test";

// Create nutzap event
const nutzap = await mockNutzap(
  "https://mint.example.com",  // mint URL
  100,                          // amount (sats)
  ndk,                          // NDK instance
  {
    senderPk: alice.pubkey,
    recipientPubkey: bob.pubkey,
    content: "Here's a tip!",
    eventId: originalEvent.id   // optional: zapping an event
  }
);

// Create individual Cashu proof
const proof = mockProof(
  "03a5...",  // C (commitment)
  50,         // amount
  "02b3..."   // optional: p2pk lock pubkey
);
```

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
  const alice = UserGenerator.getUser("alice", ndk);

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

### Testing Multi-Relay Scenarios

```typescript
it("should handle events from multiple relays", async () => {
  pool.addMockRelay("wss://relay1.example.com");
  pool.addMockRelay("wss://relay2.example.com");

  const event = await EventGenerator.createSignedTextNote("Multi-relay", alice.pubkey);

  // Simulate event on all relays
  pool.simulateEventOnAll(event);

  // Your app should deduplicate and handle once
  // ... test your app logic here
});
```

### Testing Network Failures

```typescript
it("should handle relay disconnections", async () => {
  const relay = new RelayMock("wss://relay.example.com", {
    simulateDisconnect: true,
    disconnectAfter: 1000
  });

  pool.addMockRelay(relay);

  // Test your app's reconnection logic
  await relay.connect();

  // Wait for disconnect
  await new Promise(resolve => setTimeout(resolve, 1500));

  expect(relay.status).not.toBe(NDKRelayStatus.CONNECTED);

  // Test reconnection
  // ... your app logic
});
```

### Testing Time-Dependent Operations

```typescript
it("should retry failed operations", async () => {
  vi.useFakeTimers();
  const timeController = withTimeControl(vi);

  const relay = pool.getMockRelay("wss://relay.example.com");
  relay.failNextPublish = true;

  // Your app code that retries publish after 5 seconds
  const publishPromise = myApp.publishWithRetry(event);

  // Advance time
  await timeController.tickAsync(5000);

  // Should have retried
  await expect(publishPromise).resolves.toBeTruthy();
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
const alice = UserGenerator.getUser("alice", ndk);

// ❌ Avoid: Random users make tests flaky
const randomUser = UserGenerator.getRandomUser(ndk);
```

### 3. Initialize EventGenerator Early

```typescript
beforeEach(() => {
  ndk = new NDK({ explicitRelayUrls: [] });
  EventGenerator.setNDK(ndk); // Do this before creating events
});
```

### 4. Test Relay Behavior Explicitly

```typescript
// ✅ Good: Clear what relay behavior you're testing
const relay = pool.getMockRelay("wss://relay.example.com");
relay.simulateEvent(event);
relay.simulateEOSE();

// ❌ Avoid: Implicit relay behavior
pool.simulateEventOnAll(event);
```

### 5. Use TestFixture for Complex Setups

```typescript
// ✅ Good: Less boilerplate for comprehensive tests
const fixture = new TestFixture();
const alice = fixture.getUser("alice");
fixture.setupSigner("alice");

// ❌ Avoid: Manual setup everywhere
const alice = UserGenerator.getUser("alice", ndk);
const signer = SignerGenerator.getSigner("alice");
ndk.signer = signer;
```

### 6. Test Both Success and Failure Paths

```typescript
it("should handle successful publish", async () => {
  // Test success case
});

it("should handle failed publish", async () => {
  relay.failNextPublish = true;
  // Test failure case
});
```

### 7. Verify Event Structure

```typescript
expect(event.kind).toBe(1);
expect(event.content).toBe("expected content");
expect(event.tags).toContainEqual(["p", bobPubkey]);
expect(event.sig).toBeDefined();
```

## Additional Resources

- [NDK Documentation](https://github.com/nostr-dev-kit/ndk)
- [Vitest Documentation](https://vitest.dev)
- [Nostr Protocol Specification](https://github.com/nostr-protocol/nips)

## Need Help?

If you encounter issues or have questions about testing with NDK:
- Open an issue: https://github.com/nostr-dev-kit/ndk/issues
- Join the discussion: [NDK Discord/Telegram/etc]
