# Relay Pool Testing

This guide demonstrates how to test relay pool behavior and event handling using NDK's test utilities.

## Basic Relay Pool Setup

Create and configure a mock relay pool:

```typescript
import { RelayPoolMock } from "@nostr-dev-kit/ndk/test";
import { NDK } from "@nostr-dev-kit/ndk";

describe("Relay Pool Tests", () => {
    let poolMock: RelayPoolMock;
    let ndk: NDK;

    beforeEach(() => {
        ndk = new NDK();
        poolMock = new RelayPoolMock();

        // Add multiple relays to the pool
        poolMock.addRelay("wss://relay1.test");
        poolMock.addRelay("wss://relay2.test");
        poolMock.addRelay("wss://relay3.test");
    });

    it("should handle events across relays", async () => {
        const relay1 = poolMock.getRelay("wss://relay1.test");
        const relay2 = poolMock.getRelay("wss://relay2.test");

        // Connect relays
        await relay1.connect();
        await relay2.connect();

        // Test event propagation
        const event = {
            /* event data */
        };
        await relay1.simulateEvent(event);
        await relay2.simulateEvent(event);
    });
});
```

## Advanced Pool Testing

### Testing Event Distribution

```typescript
import { EventGenerator } from "@nostr-dev-kit/ndk/test";

// Create events to distribute
const generator = new EventGenerator();
const events = await Promise.all([
    generator.textNote("Event 1"),
    generator.textNote("Event 2"),
    generator.textNote("Event 3"),
]);

// Distribute events across relays
const relays = [
    poolMock.getRelay("wss://relay1.test"),
    poolMock.getRelay("wss://relay2.test"),
    poolMock.getRelay("wss://relay3.test"),
];

// Simulate different events on different relays
await Promise.all(events.map((event, i) => relays[i].simulateEvent(event)));
```

### Testing Relay Selection

```typescript
// Configure relay weights
poolMock.setRelayWeight("wss://relay1.test", 1.0);
poolMock.setRelayWeight("wss://relay2.test", 0.5);
poolMock.setRelayWeight("wss://relay3.test", 0.25);

// Test relay selection
const selectedRelay = poolMock.selectRelay();
expect(selectedRelay.url).toBeDefined();
```

## Testing Scenarios

### Load Balancing

```typescript
// Test load balancing across relays
const stats = {
    relay1: 0,
    relay2: 0,
    relay3: 0,
};

// Simulate multiple selections
for (let i = 0; i < 1000; i++) {
    const relay = poolMock.selectRelay();
    if (relay.url === "wss://relay1.test") stats.relay1++;
    if (relay.url === "wss://relay2.test") stats.relay2++;
    if (relay.url === "wss://relay3.test") stats.relay3++;
}

// Verify distribution
expect(stats.relay1).toBeGreaterThan(stats.relay2);
expect(stats.relay2).toBeGreaterThan(stats.relay3);
```

### Failover Testing

```typescript
// Test relay failover behavior
const primaryRelay = poolMock.getRelay("wss://relay1.test");
const backupRelay = poolMock.getRelay("wss://relay2.test");

// Simulate primary relay failure
await primaryRelay.connect();
await primaryRelay.simulateDisconnect();

// Verify failover
expect(poolMock.getConnectedRelays()).not.toContain(primaryRelay);
expect(backupRelay.connect()).resolves.toBeDefined();
```

### Event Deduplication

```typescript
// Test event deduplication across relays
const receivedEvents = new Set();
const eventHandler = (event) => {
    receivedEvents.add(event.id);
};

// Subscribe to events on all relays
poolMock.getAllRelays().forEach((relay) => {
    relay.subscribe({
        subId: "test",
        filters: [{ kinds: [1] }],
        eventReceived: eventHandler,
    });
});

// Simulate same event on multiple relays
const event = await generator.textNote("Duplicate event");
await Promise.all(poolMock.getAllRelays().map((relay) => relay.simulateEvent(event)));

// Verify deduplication
expect(receivedEvents.size).toBe(1);
```

## Best Practices

1. Clean up after tests:

```typescript
afterEach(() => {
    // Disconnect all relays
    return Promise.all(poolMock.getAllRelays().map((relay) => relay.disconnect()));
});
```

2. Test connection states:

```typescript
// Test connection states across pool
const states = poolMock.getAllRelays().map((relay) => relay.status);
expect(states).toContain(2); // CONNECTED
expect(states).not.toContain(0); // DISCONNECTED
```

3. Test subscription management:

```typescript
// Test subscription across pool
const subId = "test-sub";
const filter = { kinds: [1] };

poolMock.getAllRelays().forEach((relay) => {
    relay.subscribe({
        subId,
        filters: [filter],
        eventReceived: () => {},
    });
});

// Verify subscriptions
poolMock.getAllRelays().forEach((relay) => {
    expect(relay.hasSubscription(subId)).toBe(true);
});
```

4. Test error handling:

```typescript
// Test error propagation
const errorRelay = poolMock.getRelay("wss://relay1.test");
const errorHandler = vitest.fn();

errorRelay.on("error", errorHandler);
await errorRelay.simulateError(new Error("Test error"));

expect(errorHandler).toHaveBeenCalled();
```

5. Test relay removal:

```typescript
// Test removing relays from pool
const relayUrl = "wss://relay1.test";
poolMock.removeRelay(relayUrl);

expect(poolMock.getRelay(relayUrl)).toBeUndefined();
expect(poolMock.getAllRelays()).not.toContain(relayUrl);
```
