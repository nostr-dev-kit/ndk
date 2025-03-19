# @nostr-dev-kit/ndk-test-utils

Test helpers, mocks, and stubs for the Nostr Development Kit (NDK). This package provides utilities to make testing NDK applications easier.

## Installation

```bash
pnpm add --save-dev @nostr-dev-kit/ndk-test-utils
```

## Available Utilities

### Mocks

#### RelayMock

A mock implementation of NDK relays for testing:

```typescript
import { RelayMock } from "@nostr-dev-kit/ndk-test-utils";

// Create a mock relay with options
const mockRelay = new RelayMock("wss://mock.relay", {
    simulateDisconnect: false,
    connectionDelay: 100,
    autoConnect: true
});

// Connect/disconnect
await mockRelay.connect();
await mockRelay.disconnect();

// Simulate events
const event = /* your NDK event */;
await mockRelay.simulateEvent(event);

// Simulate other relay messages
mockRelay.simulateReceiveMessage('["NOTICE", "Test notice"]');
mockRelay.simulateEOSE("subscription_id");
mockRelay.simulateNotice("This is a notice");
```

#### RelayPoolMock

A mock implementation of NDK relay pools:

```typescript
import { RelayPoolMock } from "@nostr-dev-kit/ndk-test-utils";

// Create a mock relay pool
const poolMock = new RelayPoolMock();

// Add relays to the pool
poolMock.addRelay("wss://mock1.relay");
poolMock.addRelay("wss://mock2.relay");

// Access a specific relay mock
const relay = poolMock.getRelay("wss://mock1.relay");
```

#### EventGenerator

Utility for generating test events:

```typescript
import { EventGenerator } from "@nostr-dev-kit/ndk-test-utils";

// Create events for testing
const generator = new EventGenerator();
const textNote = await generator.textNote("Hello World");
const metadata = await generator.metadata({ name: "Test User" });
const contactList = await generator.contactList(["pubkey1", "pubkey2"]);
```

#### NutzapMock

Utilities for testing nutzap functionality:

```typescript
import { mockNutzap, mockProof } from "@nostr-dev-kit/ndk-test-utils";

// Create a mock proof for testing
const proof = mockProof("mint", 100, "recipientPubkey");

// Create a mock nutzap
const nutzap = await mockNutzap("mint", 100, ndk, {
    recipientPubkey: "pubkey",
    content: "Test zap",
});
```

## License

MIT
