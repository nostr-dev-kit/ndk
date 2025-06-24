# Nutzap Testing

This guide demonstrates how to test Cashu token and Nutzap functionality using NDK's test utilities.

## Basic Nutzap Testing

Create and test Nutzap events:

```typescript
import { mockNutzap, mockProof } from "@nostr-dev-kit/ndk/test";
import { NDK } from "@nostr-dev-kit/ndk";

describe("Nutzap Tests", () => {
    let ndk: NDK;

    beforeEach(() => {
        ndk = new NDK();
    });

    it("should create a mock nutzap", async () => {
        // Create a mock nutzap with basic parameters
        const nutzap = await mockNutzap("mint", 100, ndk, {
            recipientPubkey: "recipient_pubkey",
            content: "Test zap",
        });

        expect(nutzap.amount).toBe(100);
        expect(nutzap.kind).toBe(9739); // Cashu token event kind
    });
});
```

## Testing Cashu Proofs

```typescript
// Create a mock proof
const proof = mockProof("mint", 100, "recipient_pubkey");

expect(proof).toHaveProperty("amount");
expect(proof).toHaveProperty("secret");
expect(proof.amount).toBe(100);
```

## Advanced Nutzap Testing

### Testing Token Events

```typescript
// Create a nutzap with multiple proofs
const nutzap = await mockNutzap("mint", 500, ndk, {
    recipientPubkey: "recipient_pubkey",
    content: "Multi-proof zap",
    proofCount: 3, // Split into 3 proofs
});

// Verify proofs
const proofs = nutzap.getProofs();
expect(proofs).toHaveLength(3);
expect(proofs.reduce((sum, p) => sum + p.amount, 0)).toBe(500);
```

### Testing Token Processing

```typescript
import { RelayMock } from "@nostr-dev-kit/ndk/test";

// Set up relay and monitor
const relay = new RelayMock("wss://test.relay");
const processedTokens = [];

// Subscribe to token events
relay.subscribe({
    subId: "tokens",
    filters: [{ kinds: [9739] }],
    eventReceived: (event) => processedTokens.push(event),
});

// Create and simulate token events
const token1 = await mockNutzap("mint", 100, ndk, {
    recipientPubkey: "user1",
});
const token2 = await mockNutzap("mint", 200, ndk, {
    recipientPubkey: "user2",
});

await relay.simulateEvent(token1);
await relay.simulateEvent(token2);

expect(processedTokens).toHaveLength(2);
```

## Testing Scenarios

### Token Spending

```typescript
// Test token spending flow
const initialToken = await mockNutzap("mint", 1000, ndk, {
    recipientPubkey: "spender",
});

// Create a spend proof
const spendProof = mockProof("spend", 500, "recipient");

// Create spent token event
const spentToken = await mockNutzap("spend", 500, ndk, {
    recipientPubkey: "recipient",
    content: "Spent token",
    proofs: [spendProof],
});

expect(spentToken.amount).toBe(500);
expect(spentToken.getProofs()[0].type).toBe("spend");
```

### Token Verification

```typescript
// Test token verification
const token = await mockNutzap("mint", 100, ndk, {
    recipientPubkey: "recipient",
});

// Verify token structure
expect(token).toHaveProperty("id");
expect(token).toHaveProperty("pubkey");
expect(token).toHaveProperty("sig");
expect(token.verify()).resolves.toBe(true);

// Verify token content
const proofs = token.getProofs();
expect(proofs[0].mint).toBeDefined();
expect(proofs[0].amount).toBe(100);
```

## Best Practices

1. Clean up after tests:

```typescript
afterEach(() => {
    // Clear any stored tokens/proofs
    mockNutzap.clearMocks();
});
```

2. Test error cases:

```typescript
// Test invalid amount
expect(async () => {
    await mockNutzap("mint", -100, ndk, {
        recipientPubkey: "recipient",
    });
}).rejects.toThrow();

// Test missing recipient
expect(async () => {
    await mockNutzap("mint", 100, ndk, {
        content: "No recipient",
    });
}).rejects.toThrow();
```

3. Test proof validation:

```typescript
const proof = mockProof("mint", 100, "recipient");

expect(proof.validate()).toBe(true);
expect(proof.amount).toBeGreaterThan(0);
expect(proof.secret).toBeDefined();
```

4. Test token splitting and merging:

```typescript
// Create a token that can be split
const originalToken = await mockNutzap("mint", 1000, ndk, {
    recipientPubkey: "holder",
    proofCount: 1,
});

// Split into multiple proofs
const splitToken = await mockNutzap("split", 1000, ndk, {
    recipientPubkey: "holder",
    proofCount: 4, // Split into 4 equal proofs
    originalProofs: originalToken.getProofs(),
});

expect(splitToken.getProofs()).toHaveLength(4);
expect(splitToken.amount).toBe(1000);
```

```

```
