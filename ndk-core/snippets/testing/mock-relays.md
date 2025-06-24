# Mock Relays for Testing

This guide demonstrates how to use NDK's test utilities to create and work with mock relays in your tests.

## Installation

First, install the test utilities package:

```bash
pnpm add --save-dev @nostr-dev-kit/ndk/test
```

## Basic Mock Relay Usage

Create and use a basic mock relay:

```typescript
import { RelayMock } from "@nostr-dev-kit/ndk/test";
import { NDK } from "@nostr-dev-kit/ndk";

describe("Mock Relay Tests", () => {
    let relayMock: RelayMock;
    let ndk: NDK;

    beforeEach(() => {
        // Create a new NDK instance
        ndk = new NDK();

        // Create a mock relay
        relayMock = new RelayMock("wss://test.relay", {
            simulateDisconnect: false, // Don't randomly disconnect
            connectionDelay: 100, // Simulate 100ms connection delay
            autoConnect: true, // Auto-connect when used
        });
    });

    it("should handle events", async () => {
        // Connect to the mock relay
        await relayMock.connect();

        // Create a subscription
        const sub = relayMock.subscribe({
            subId: "test-sub",
            filters: [{ kinds: [1] }], // Subscribe to text notes
        });

        // Simulate receiving an event
        const event = {
            kind: 1,
            content: "Hello World",
            // ... other event fields
        };
        await relayMock.simulateEvent(event);

        // Clean up
        await relayMock.disconnect();
    });
});
```

## Advanced Mock Relay Features

### Simulating Network Conditions

```typescript
// Create a flaky relay that randomly disconnects
const flakyRelay = new RelayMock("wss://flaky.relay", {
    simulateDisconnect: true,
    disconnectChance: 0.3, // 30% chance to disconnect on operations
    connectionDelay: 500, // 500ms connection delay
});

// Test reconnection behavior
await flakyRelay.connect();
await flakyRelay.simulateDisconnect(); // Force a disconnect
await flakyRelay.connect(); // Should reconnect
```

### Testing Event Publishing

```typescript
import { RelayMock, EventGenerator } from "@nostr-dev-kit/ndk/test";

// Create an event generator
const generator = new EventGenerator();

// Generate a test event
const textNote = await generator.textNote("Test message");

// Publish and verify
const publishSpy = vitest.spyOn(relayMock, "publish");
await relayMock.publish(textNote);

expect(publishSpy).toHaveBeenCalledWith(textNote);
```

### Simulating Relay Messages

```typescript
// Simulate various relay messages
relayMock.simulateNotice("Server restarting in 5 minutes");
relayMock.simulateEOSE("subscription-id");
relayMock.simulateOK("event-id", true, "success");

// Simulate raw messages
relayMock.simulateReceiveMessage('["AUTH", "challenge"]');
```

## Testing Multiple Relays

Use RelayPoolMock to test multiple relay scenarios:

```typescript
import { RelayPoolMock } from "@nostr-dev-kit/ndk/test";

// Create a mock relay pool
const poolMock = new RelayPoolMock();

// Add multiple relays
poolMock.addRelay("wss://relay1.test");
poolMock.addRelay("wss://relay2.test");

// Get specific relay mock
const relay1 = poolMock.getRelay("wss://relay1.test");
const relay2 = poolMock.getRelay("wss://relay2.test");

// Test event propagation across relays
const event = await generator.textNote("Test across relays");
await relay1.simulateEvent(event); // Simulate event on first relay
await relay2.simulateEvent(event); // Simulate same event on second relay
```

## Best Practices

1. Always clean up relays after tests:

```typescript
afterEach(async () => {
    await relayMock.disconnect();
});
```

2. Reset event generators between tests:

```typescript
beforeEach(() => {
    EventGenerator.setNDK(ndk); // Reset with fresh NDK instance
});
```

3. Use realistic delays to simulate network conditions:

```typescript
const relay = new RelayMock("wss://test.relay", {
    connectionDelay: 100, // Connection time
    operationDelay: 50, // Time for operations
    disconnectDelay: 75, // Disconnection time
});
```

4. Test error scenarios:

```typescript
// Test failed connections
const failingRelay = new RelayMock("wss://failing.relay", {
    simulateConnectionError: true,
});

try {
    await failingRelay.connect();
} catch (error) {
    expect(error).toBeDefined();
}
```
