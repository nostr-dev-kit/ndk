# NDK Testing Infrastructure Refactor

## Overview

This document outlines the comprehensive refactoring plan for the NDK testing infrastructure. The goals of this refactor are to:

1. Improve test reliability and reduce flakiness
2. Speed up test execution through better tooling
3. Create a robust mocking framework for relay communications
4. Make it easier to write and maintain tests across all NDK packages
5. Increase test coverage, especially around network interactions

Take into account we are working in a monorepo with multiple packages.
We are using pnpm.

## Technologies

We are transitioning to the following technologies:

- **Vitest**: Modern, fast test runner compatible with Jest API but with better ES module support
- **MSW (Mock Service Worker)**: Network-level request interception for WebSocket/HTTP mocking
- **Sinon.js**: Comprehensive mocking, stubbing, and spying library

## Directory Structure

```
packages/ndk/
├── test/                   # Test utilities and infrastructure
│   ├── setup/              # Global test setup
│   │   ├── vitest.setup.ts # Vitest setup and configuration
│   │   └── msw.setup.ts    # MSW setup
│   ├── mocks/              # Mock implementations
│   │   ├── relay/          # Relay mocking infrastructure
│   │   │   ├── MockRelay.ts       # Mock relay implementation
│   │   │   ├── MockRelayPool.ts   # Collection of mock relays
│   │   │   └── MockConnection.ts  # Mock WebSocket connection
│   │   ├── events/         # Event generation and utilities
│   │   │   ├── EventGenerator.ts  # Create test events
│   │   │   └── EventSequences.ts  # Pre-defined event sequences
│   │   └── network/        # Network mocking (MSW)
│   │       ├── handlers.ts        # WebSocket and HTTP handlers
│   │       └── setupServer.ts     # MSW server setup
│   ├── scenarios/          # Test scenario builders
│   │   ├── SubscriptionScenario.ts # Subscription testing scenarios
│   │   ├── PublishScenario.ts      # Publishing testing scenarios
│   │   └── ConnectionScenario.ts   # Connection testing scenarios
│   ├── assertions/         # Custom test assertions
│   │   ├── eventAssertions.ts      # Event-related assertions
│   │   ├── relayAssertions.ts      # Relay-related assertions
│   │   └── subscriptionAssertions.ts # Subscription-related assertions
│   └── helpers/            # Additional test helpers
│       ├── time.ts         # Time manipulation utilities
│       └── fixtures.ts     # Test fixtures and data
└── vitest.config.ts        # Vitest configuration
```

## Setup Steps

### 1. Basic Vitest Configuration

Create a basic Vitest configuration file:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        setupFiles: ["./test/setup/vitest.setup.ts"],
        include: ["src/**/*.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: ["**/node_modules/**", "**/test/**"],
        },
        testTimeout: 10000,
    },
});
```

### 2. MSW Setup

Set up MSW for intercepting WebSocket connections:

```typescript
// test/setup/msw.setup.ts
import { setupServer } from "msw/node";
import { handlers } from "../mocks/network/handlers";

// Create the MSW server with our handlers
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
```

### 3. Vitest Global Setup

Create a global setup file for Vitest:

```typescript
// test/setup/vitest.setup.ts
import { expect, vi } from "vitest";
import * as matchers from "./assertions/customMatchers";
import "./msw.setup";

// Add custom matchers
expect.extend(matchers);

// Mock timers globally
vi.useFakeTimers();
```

## Core Mock Components

### 1. MockRelay Implementation

The `MockRelay` class will implement the `NDKRelay` interface to simulate a relay:

```typescript
// test/mocks/relay/MockRelay.ts
import { NDKRelay, NDKRelayStatus } from "../../../src";
import { EventEmitter } from "events";

class MockRelay extends EventEmitter implements NDKRelay {
    public url: string;
    private _status: NDKRelayStatus = NDKRelayStatus.DISCONNECTED;
    public messageLog: Array<{ direction: "in" | "out"; message: string }> = [];

    // Configurable behavior for testing
    public options: {
        simulateDisconnect: boolean;
        disconnectAfter: number;
        connectionDelay: number;
        autoConnect: boolean;
        failNextPublish: boolean;
    };

    constructor(url: string, options = {}) {
        super();
        this.url = url;
        this.options = {
            simulateDisconnect: false,
            disconnectAfter: 5000,
            connectionDelay: 0,
            autoConnect: true,
            failNextPublish: false,
            ...options,
        };

        if (this.options.autoConnect) {
            this.connect();
        }
    }

    // Core methods matching NDKRelay interface
    async connect() {
        this._status = NDKRelayStatus.CONNECTING;

        if (this.options.connectionDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, this.options.connectionDelay));
        }

        this._status = NDKRelayStatus.CONNECTED;
        this.emit("connect");

        if (this.options.simulateDisconnect) {
            setTimeout(() => {
                this._status = NDKRelayStatus.DISCONNECTED;
                this.emit("disconnect");
            }, this.options.disconnectAfter);
        }
    }

    async disconnect() {
        this._status = NDKRelayStatus.DISCONNECTING;
        await Promise.resolve();
        this._status = NDKRelayStatus.DISCONNECTED;
        this.emit("disconnect");
    }

    get status(): NDKRelayStatus {
        return this._status;
    }

    send(message: string): void {
        if (this.status !== NDKRelayStatus.CONNECTED) {
            throw new Error("Attempting to send on a closed relay connection");
        }

        this.messageLog.push({ direction: "out", message });
    }

    async publish(event): Promise<boolean> {
        if (this.options.failNextPublish) {
            this.options.failNextPublish = false;
            return false;
        }

        const message = JSON.stringify(["EVENT", event]);
        this.send(message);
        return true;
    }

    // Additional methods for testing
    simulateReceiveMessage(message: string): void {
        this.messageLog.push({ direction: "in", message });
        this.emit("message", message);
    }

    simulateEvent(event): void {
        const message = JSON.stringify(["EVENT", event.id, event]);
        this.simulateReceiveMessage(message);
    }

    simulateEOSE(subscriptionId: string): void {
        const message = JSON.stringify(["EOSE", subscriptionId]);
        this.simulateReceiveMessage(message);
    }

    simulateNotice(message: string): void {
        const notice = JSON.stringify(["NOTICE", message]);
        this.simulateReceiveMessage(notice);
    }

    reset(): void {
        this.messageLog = [];
        this.options.failNextPublish = false;
    }
}

export { MockRelay };
```

### 2. MockRelayPool Implementation

A collection of mock relays that can be used to test relay selection and interaction:

```typescript
// test/mocks/relay/MockRelayPool.ts
import { NDKRelayPool, NDKRelayStatus } from "../../../src";
import { MockRelay } from "./MockRelay";

class MockRelayPool extends NDKRelayPool {
    mockRelays: Map<string, MockRelay> = new Map();

    constructor() {
        super();
    }

    addMockRelay(url: string, options = {}): MockRelay {
        const mockRelay = new MockRelay(url, options);
        this.mockRelays.set(url, mockRelay);
        this.addRelay(mockRelay);
        return mockRelay;
    }

    getMockRelay(url: string): MockRelay | undefined {
        return this.mockRelays.get(url);
    }

    simulateEventOnAll(event): void {
        for (const relay of this.mockRelays.values()) {
            relay.simulateEvent(event);
        }
    }

    simulateEventOn(relayUrls: string[], event): void {
        for (const url of relayUrls) {
            const relay = this.mockRelays.get(url);
            if (relay) relay.simulateEvent(event);
        }
    }

    simulateEOSEOnAll(subscriptionId: string): void {
        for (const relay of this.mockRelays.values()) {
            relay.simulateEOSE(subscriptionId);
        }
    }

    disconnectAll(): void {
        for (const relay of this.mockRelays.values()) {
            relay.disconnect();
        }
    }

    resetAll(): void {
        for (const relay of this.mockRelays.values()) {
            relay.reset();
        }
    }
}

export { MockRelayPool };
```

### 3. MSW WebSocket Handlers

Set up MSW to intercept WebSocket connections:

```typescript
// test/mocks/network/handlers.ts
import { http, HttpResponse, WebSocketLink } from "msw";
import { EVENT_TYPES } from "../../../src/relay/messages";

// Store active WebSocket connections
const activeConnections = new Map();

// Create MSW WebSocket handlers
export const handlers = [
    // Intercept WebSocket connections
    http.upgrade((req) => {
        const url = req.url;
        const socket = new WebSocketLink(req);

        activeConnections.set(url, socket);

        // Handle messages from the client
        socket.on("message", (message) => {
            const data = JSON.parse(message);

            // Handle different message types
            if (data[0] === "REQ") {
                const subId = data[1];
                // Handle subscription requests
                // This is where we would implement relay-specific behavior
            }

            if (data[0] === "EVENT") {
                // Handle event publication
            }

            if (data[0] === "CLOSE") {
                // Handle subscription closing
            }
        });

        socket.on("close", () => {
            activeConnections.delete(url);
        });

        return socket;
    }),

    // Fallback for all HTTP requests
    http.all("*", () => {
        return new HttpResponse(null, { status: 404 });
    }),
];

// Helper functions to interact with active WebSocket connections
export const webSocketHelpers = {
    // Send a message to a specific WebSocket connection
    sendMessage(url, message) {
        const socket = activeConnections.get(url);
        if (socket) {
            socket.send(typeof message === "string" ? message : JSON.stringify(message));
        }
    },

    // Simulate an event coming from a relay
    simulateEvent(url, event) {
        this.sendMessage(url, ["EVENT", "", event]);
    },

    // Simulate EOSE for a subscription
    simulateEOSE(url, subscriptionId) {
        this.sendMessage(url, ["EOSE", subscriptionId]);
    },

    // Close a WebSocket connection
    closeConnection(url) {
        const socket = activeConnections.get(url);
        if (socket) {
            socket.close();
            activeConnections.delete(url);
        }
    },

    // Close all WebSocket connections
    closeAllConnections() {
        for (const [url, socket] of activeConnections.entries()) {
            socket.close();
            activeConnections.delete(url);
        }
    },
};
```

## Event Generation and Testing

### 1. Event Generator

Create a utility for generating test events:

```typescript
// test/mocks/events/EventGenerator.ts
import { NDKEvent, NDKKind } from "../../../src";
import { generatePrivateKey, getPublicKey } from "nostr-tools";

export class EventGenerator {
    private static privateKeys = new Map<string, string>();

    static getPrivateKeyForPubkey(pubkey: string): string {
        if (!this.privateKeys.has(pubkey)) {
            const privateKey = generatePrivateKey();
            this.privateKeys.set(getPublicKey(privateKey), privateKey);
        }
        return this.privateKeys.get(pubkey) || "";
    }

    static createSignedTextNote(content: string, pubkey?: string): NDKEvent {
        pubkey = pubkey || getPublicKey(generatePrivateKey());
        const privateKey = this.getPrivateKeyForPubkey(pubkey);

        const event = new NDKEvent();
        event.kind = NDKKind.Text;
        event.pubkey = pubkey;
        event.content = content;
        event.created_at = Math.floor(Date.now() / 1000);

        // Sign the event
        event.sign(privateKey);

        return event;
    }

    static createEncryptedDirectMessage(content: string, from: string, to: string): NDKEvent {
        const fromPrivateKey = this.getPrivateKeyForPubkey(from);

        const event = new NDKEvent();
        event.kind = NDKKind.EncryptedDirectMessage;
        event.pubkey = from;
        event.content = content; // In real code this would be encrypted
        event.created_at = Math.floor(Date.now() / 1000);
        event.tags.push(["p", to]);

        // Sign the event
        event.sign(fromPrivateKey);

        return event;
    }

    static createRepost(originalEvent: NDKEvent, pubkey?: string): NDKEvent {
        pubkey = pubkey || getPublicKey(generatePrivateKey());
        const privateKey = this.getPrivateKeyForPubkey(pubkey);

        const event = new NDKEvent();
        event.kind = NDKKind.Repost;
        event.pubkey = pubkey;
        event.content = JSON.stringify(originalEvent.rawEvent());
        event.created_at = Math.floor(Date.now() / 1000);
        event.tags.push(["e", originalEvent.id]);
        event.tags.push(["p", originalEvent.pubkey]);

        // Sign the event
        event.sign(privateKey);

        return event;
    }

    // More specialized event creators can be added here
}
```

### 2. Subscription Testing

Create a subscription scenario builder:

```typescript
// test/scenarios/SubscriptionScenario.ts
import { NDKRelay, NDKFilter, NDKEvent } from "../../../src";
import { MockRelayPool } from "../mocks/relay/MockRelayPool";

class SubscriptionScenario {
    private pool: MockRelayPool;
    private filters: NDKFilter[];
    private events: NDKEvent[] = [];
    private subId: string = "";
    private eoseDelay: number = 100;

    constructor(pool: MockRelayPool, filters: NDKFilter | NDKFilter[]) {
        this.pool = pool;
        this.filters = Array.isArray(filters) ? filters : [filters];
        this.subId = Math.random().toString(36).substring(2, 15);
    }

    withEvents(events: NDKEvent[]): this {
        this.events = events;
        return this;
    }

    withEOSEDelay(delayMs: number): this {
        this.eoseDelay = delayMs;
        return this;
    }

    async execute(): Promise<string> {
        // First we distribute events to relays
        const relays = Array.from(this.pool.mockRelays.values());

        // Simulate subscription open
        setTimeout(() => {
            // Send events with slight delays between them
            this.events.forEach((event, index) => {
                setTimeout(() => {
                    // Randomly choose a subset of relays to deliver each event
                    const relayCount = Math.max(1, Math.floor(Math.random() * relays.length));
                    const selectedRelays = relays.slice(0, relayCount);

                    selectedRelays.forEach((relay) => {
                        relay.simulateEvent(event);
                    });
                }, index * 50); // 50ms between events
            });

            // Finally send EOSE on all relays
            setTimeout(() => {
                relays.forEach((relay) => {
                    relay.simulateEOSE(this.subId);
                });
            }, this.eoseDelay);
        }, 10);

        return this.subId;
    }
}

export { SubscriptionScenario };
```

## Test Assertions

Create custom assertions for testing NDK components:

```typescript
// test/assertions/eventAssertions.ts
import { expect } from "vitest";
import { NDKEvent } from "../../../src";

export function expectEventToBeValid(event: NDKEvent): void {
    expect(event).toBeDefined();
    expect(event.id).toBeDefined();
    expect(event.sig).toBeDefined();
    expect(event.created_at).toBeGreaterThan(0);
    expect(event.kind).toBeDefined();
    expect(event.pubkey).toBeDefined();
}

export function expectEventsToMatch(
    actual: NDKEvent,
    expected: NDKEvent,
    ignoreFields: string[] = []
): void {
    const actualRaw = actual.rawEvent();
    const expectedRaw = expected.rawEvent();

    // Don't check these fields unless explicitly requested
    const defaultIgnore = ["id", "sig", "created_at"];
    const fieldsToIgnore = [...new Set([...defaultIgnore, ...ignoreFields])];

    for (const field of fieldsToIgnore) {
        delete actualRaw[field];
        delete expectedRaw[field];
    }

    expect(actualRaw).toEqual(expectedRaw);
}

export function expectEventsToBeSorted(events: NDKEvent[], ascending: boolean = true): void {
    if (events.length <= 1) return;

    for (let i = 1; i < events.length; i++) {
        const prev = events[i - 1].created_at;
        const curr = events[i].created_at;

        if (ascending) {
            expect(prev).toBeLessThanOrEqual(curr);
        } else {
            expect(prev).toBeGreaterThanOrEqual(curr);
        }
    }
}
```

## Test Helpers

Create time management utilities for testing:

```typescript
// test/helpers/time.ts
import { vi } from "vitest";

export class TimeController {
    static advanceTime(ms: number): void {
        vi.advanceTimersByTime(ms);
    }

    static async tickAsync(ms: number = 0): Promise<void> {
        await vi.advanceTimersByTimeAsync(ms);
    }

    static reset(): void {
        vi.clearAllTimers();
    }

    static async waitForNextTick(): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 0));
        await vi.advanceTimersByTimeAsync(0);
    }
}

export function withTimeControl(
    fn: (timeController: TimeController) => Promise<void>
): () => Promise<void> {
    return async () => {
        vi.useFakeTimers();
        try {
            await fn(TimeController);
        } finally {
            vi.useRealTimers();
        }
    };
}
```

## Sample Test Using the New Infrastructure

Here's a sample test that uses our new mocking infrastructure:

```typescript
// src/subscription.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NDK, NDKSubscription, NDKFilter, NDKKind } from "../src";
import { MockRelayPool } from "./test/mocks/relay/MockRelayPool";
import { EventGenerator } from "./test/mocks/events/EventGenerator";
import { SubscriptionScenario } from "./test/scenarios/SubscriptionScenario";
import { expectEventToBeValid, expectEventsToMatch } from "./test/assertions/eventAssertions";
import { withTimeControl } from "./test/helpers/time";

describe("NDKSubscription", () => {
    let ndk: NDK;
    let pool: MockRelayPool;

    beforeEach(() => {
        pool = new MockRelayPool();
        ndk = new NDK({ explicitRelayUrls: [] });
        ndk.pool = pool;

        // Add some mock relays
        pool.addMockRelay("wss://relay1.example.com");
        pool.addMockRelay("wss://relay2.example.com");
        pool.addMockRelay("wss://relay3.example.com");
    });

    afterEach(() => {
        pool.disconnectAll();
        pool.resetAll();
    });

    it(
        "should receive events matching the filter",
        withTimeControl(async (time) => {
            // Create test events
            const event1 = EventGenerator.createSignedTextNote("Hello world #1");
            const event2 = EventGenerator.createSignedTextNote("Hello world #2");
            const event3 = EventGenerator.createSignedTextNote("Hello world #3");

            // Define filter
            const filter: NDKFilter = { kinds: [NDKKind.Text] };

            // Set up subscription scenario
            const scenario = new SubscriptionScenario(pool, filter)
                .withEvents([event1, event2, event3])
                .withEOSEDelay(500);

            // Track received events
            const receivedEvents: NDKEvent[] = [];

            // Create subscription
            const sub = new NDKSubscription(ndk, filter);
            sub.on("event", (event: NDKEvent) => {
                receivedEvents.push(event);
            });

            // Execute test
            await sub.start();
            await scenario.execute();

            // Advance time to get all events
            await time.tickAsync(1000);

            // Verify results
            expect(receivedEvents.length).toEqual(3);
            expectEventToBeValid(receivedEvents[0]);
            expectEventsToMatch(receivedEvents[0], event1);
            expectEventsToMatch(receivedEvents[1], event2);
            expectEventsToMatch(receivedEvents[2], event3);
        })
    );

    it(
        "should close subscription on EOSE when requested",
        withTimeControl(async (time) => {
            // Create test events
            const event = EventGenerator.createSignedTextNote("Test event");

            // Define filter
            const filter: NDKFilter = { kinds: [NDKKind.Text] };

            // Set up subscription scenario
            const scenario = new SubscriptionScenario(pool, filter)
                .withEvents([event])
                .withEOSEDelay(100);

            // Create subscription with closeOnEose=true
            const sub = new NDKSubscription(ndk, filter, { closeOnEose: true });

            // Track events
            let eventReceived = false;
            let eoseReceived = false;

            sub.on("event", () => {
                eventReceived = true;
            });
            sub.on("eose", () => {
                eoseReceived = true;
            });

            // Execute test
            await sub.start();
            await scenario.execute();

            // Advance time to get all events and EOSE
            await time.tickAsync(200);

            // Verify results
            expect(eventReceived).toBe(true);
            expect(eoseReceived).toBe(true);
            expect(sub.status).toBe("terminated");
        })
    );
});
```

## Migration Strategy

### Phase 1: Infrastructure Setup

1. Set up Vitest, MSW, and Sinon.js
2. Create core mocking components
3. Add test helpers and assertion utilities
4. Update package.json scripts

### Phase 2: Gradual Migration

1. Start with core functionality tests (events, subscriptions)
2. Move tests from Jest to Vitest one module at a time
3. Replace existing mocks with new mocking infrastructure
4. Add more comprehensive tests using the new tools

### Phase 3: Cross-Package Integration

1. Make testing infrastructure available to all NDK packages
2. Create shared test suites for common functionality
3. Ensure consistent test coverage across packages
4. Add CI workflow updates to use the new test infrastructure

## Package.json Updates

Update the package.json scripts:

```json
{
    "scripts": {
        "test": "vitest run",
        "test:watch": "vitest watch",
        "test:coverage": "vitest run --coverage",
        "test:ui": "vitest --ui"
    }
}
```

## Next Steps

1. **Implement Core Mocks**: Start by implementing the `MockRelay` and `MockRelayPool` classes
2. **Setup MSW**: Configure MSW for WebSocket interception
3. **Create Test Helpers**: Build event generators and assertion utilities
4. **Migrate Initial Tests**: Convert a few key tests to the new infrastructure as examples
5. **Document Usage**: Create examples and patterns for other developers

## Resources

- [Vitest Documentation](https://vitest.dev/guide/)
- [MSW Documentation](https://mswjs.io/docs/)
- [Sinon.js Documentation](https://sinonjs.org/releases/latest/)
- [WebSockets in MSW](https://mswjs.io/docs/api/setup-server)
