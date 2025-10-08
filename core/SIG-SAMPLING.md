# Signature Verification Sampling Implementation Plan

## Overview

This document outlines the implementation plan for adding signature verification sampling to NDK. The goal is to optimize performance by reducing the number of signature verifications while maintaining security.

Currently, NDK verifies every signature it encounters. This is computationally expensive and unnecessary - we only need to verify a sample of signatures from each relay to determine trustworthiness. Once a relay sends an invalid signature, it can be marked as untrustworthy.

Relays must always send valid signatures, a single failure means the relay is evil.

All invalid-signature detections—whether synchronous or asynchronous—will delegate to a new `NDK.reportInvalidSignature(event, relay)` method. This centralizes emission of the `event:invalid-sig` (with relay context) and supports optional auto-blacklisting of malicious relays.

## Current Architecture Analysis

### Key Components

1. **NDK Class** (`ndk-core/src/ndk/index.ts`):
    - Contains configuration properties:
        - `initialValidationRatio`: Starting validation ratio for new relays
        - `lowestValidationRatio`: Minimum validation ratio for any relay
        - `validationRatioFn`: Optional function to calculate validation ratio
    - Emits `event:invalid-sig` events when invalid signatures are detected

2. **NDKRelay Class** (`ndk-core/src/relay/index.ts`):
    - Tracks validated and non-validated event counts
    - Has methods to add validated/non-validated events
    - Has `shouldValidateEvent` method (implementation needs to be enhanced)

3. **Signature Verification** (`ndk-core/src/events/signature.ts`):
    - Contains verification logic
    - Maintains `verifiedSignatures` map to track already verified event IDs

4. **NDKSubscription Class** (`ndk-core/src/subscription/index.ts`):
    - Receives events from relays
    - Calls verification methods on events
    - Can check already verified signatures

5. **Test Utilities** (`ndk-test-utils/src/index.ts`):
    - Provides mocks and helpers for testing
    - Includes `RelayMock`, `RelayPoolMock`, and `EventGenerator`
    - Offers `TestFixture` and time control utilities

## Implementation Plan

### 1. Enhance NDKRelay Class

#### 1.1. Add Validation Statistics Tracking

```typescript
class NDKRelay {
    // Existing properties
    private validatedCount = 0;
    private nonValidatedCount = 0;
    private currentValidationRatio: number;

    constructor(url: string, authPolicy?: NDKAuthPolicy, ndk?: NDK) {
        // Existing constructor code
        this.currentValidationRatio = ndk?.initialValidationRatio || 1.0;
    }

    public addValidatedEvent(): void {
        this.validatedCount++;
        this.updateValidationRatio();
    }

    public addNonValidatedEvent(): void {
        this.nonValidatedCount++;
    }

    private updateValidationRatio(): void {
        if (!this.ndk) return;

        // Use custom function if provided
        if (this.ndk.validationRatioFn) {
            this.currentValidationRatio = this.ndk.validationRatioFn(
                this,
                this.validatedCount,
                this.nonValidatedCount,
            );
            return;
        }

        // Default ratio calculation:
        // Gradually decrease ratio based on number of validated events
        // But never go below lowestValidationRatio
        const newRatio = Math.max(
            this.ndk.lowestValidationRatio,
            this.ndk.initialValidationRatio * Math.exp(-0.01 * this.validatedCount),
        );

        this.currentValidationRatio = newRatio;
    }

    public shouldValidateEvent(): boolean {
        if (!this.ndk) return true;

        // Always validate if ratio is 1.0
        if (this.currentValidationRatio >= 1.0) return true;

        // Otherwise, randomly decide based on ratio
        return Math.random() < this.currentValidationRatio;
    }
}
```

### 2. Enhance Signature Verification Process

#### 2.1. Update NDKSubscription's `eventReceived` Method

Current method in `ndk-core/src/subscription/index.ts` needs modifications:

```typescript
public eventReceived(
    event: NDKEvent | NostrEvent,
    relay: NDKRelay | undefined,
    fromCache = false,
    optimisticPublish = false,
) {
    const eventId = event.id! as NDKEventId;
    const eventAlreadySeen = this.eventFirstSeen.has(eventId);
    let ndkEvent: NDKEvent;

    if (event instanceof NDKEvent) ndkEvent = event;

    if (!eventAlreadySeen) {
        // generate the ndkEvent
        ndkEvent ??= new NDKEvent(this.ndk, event);
        ndkEvent.ndk = this.ndk;
        ndkEvent.relay = relay;

        // Skip validation for cached or self-published events
        if (!fromCache && !optimisticPublish) {
            // Validate event structure
            if (!this.skipValidation) {
                if (!ndkEvent.isValid) {
                    this.debug("Event failed validation %s from relay %s", eventId, relay?.url);
                    return;
                }
            }

            // Verify signature with sampling
            if (relay) {
                // Check if we need to verify this event based on sampling
                const shouldVerify = relay.shouldValidateEvent();

                if (shouldVerify && !this.skipVerification) {
                    // Attempt verification
                    if (!ndkEvent.verifySignature(true) && !this.ndk.asyncSigVerification) {
                        this.debug("Event failed signature validation", event);
                        // Report the invalid signature with relay information through the centralized method
                        this.ndk.reportInvalidSignature(ndkEvent, relay);
                        return;
                    }

                    // Track successful validation
                    relay.addValidatedEvent();
                } else {
                    // We skipped verification for this event
                    relay.addNonValidatedEvent();
                }
            }

            // Cache the event if appropriate
            if (this.ndk.cacheAdapter && !this.opts.dontSaveToCache) {
                this.ndk.cacheAdapter.setEvent(ndkEvent, this.filters, relay);
            }
        }

        // Emit the event
        if (!optimisticPublish || this.skipOptimisticPublishEvent !== true) {
            this.emitEvent(this.opts?.wrap ?? false, ndkEvent, relay, fromCache, optimisticPublish);
            // Mark as seen
            this.eventFirstSeen.set(eventId, Date.now());
        }
    } else {
        // Handle duplicate events (existing code)
        const timeSinceFirstSeen = Date.now() - (this.eventFirstSeen.get(eventId) || 0);
        this.emit("event:dup", event, relay, timeSinceFirstSeen, this, fromCache, optimisticPublish);

        if (relay) {
            // Check if we've already verified this event id's signature
            const signature = verifiedSignatures.get(eventId);
            if (signature && typeof signature === "string") {
                // If signatures match, we count it as validated
                if (event.sig === signature) {
                    relay.addValidatedEvent();
                } else {
                    // Signatures don't match - this is a malicious relay!
                    // One invalid signature means the relay is considered evil
                    this.ndk.reportInvalidSignature(ndkEvent || new NDKEvent(this.ndk, event), relay);
                }
            }
        }
    }

    this.lastEventReceivedAt = Date.now();
}
```

### 3. Centralize Invalid Signature Reporting in NDK Class

#### 3.1. Add Central Reporting Method

In `ndk-core/src/ndk/index.ts`, add a centralized method for reporting invalid signatures:

```typescript
export class NDK extends EventEmitter<{
    // Existing events
    "signer:ready": (signer: NDKSigner) => void;
    "signer:required": () => void;

    // Updated event to include the relay parameter
    "event:invalid-sig": (event: NDKEvent, relay: NDKRelay) => void;

    "event:publish-failed": (
        event: NDKEvent,
        error: NDKPublishError,
        relays: WebSocket["url"][],
    ) => void;
}> {
    // Existing properties and methods

    /**
     * Centralized method to report an invalid signature, identifying the relay that provided it.
     * A single invalid signature means the relay is considered malicious.
     * All invalid signature detections (synchronous or asynchronous) should delegate to this method.
     *
     * @param event The event with an invalid signature
     * @param relay The relay that provided the invalid signature
     */
    public reportInvalidSignature(event: NDKEvent, relay: NDKRelay): void {
        this.debug(`Invalid signature detected from relay ${relay.url} for event ${event.id}`);

        // Emit event with relay information
        this.emit("event:invalid-sig", event, relay);

        // If auto-blacklisting is enabled, add the relay to the blacklist
        if (this.autoBlacklistInvalidRelays) {
            this.blacklistRelay(relay.url);
        }
    }

    /**
     * Add a relay URL to the blacklist as it has been identified as malicious
     */
    public blacklistRelay(url: string): void {
        if (!this.blacklistRelayUrls) {
            this.blacklistRelayUrls = [];
        }

        if (!this.blacklistRelayUrls.includes(url)) {
            this.blacklistRelayUrls.push(url);
            this.debug(`Added relay to blacklist: ${url}`);

            // Disconnect from this relay if connected
            const relay = this.pool.getRelay(url, false, false);
            if (relay) {
                relay.disconnect();
                this.debug(`Disconnected from blacklisted relay: ${url}`);
            }
        }
    }
}
```

### 4. Update Async Signature Verification

In `ndk-core/src/events/signature.ts`, modify the worker message handler to use the centralized reporting:

```typescript
function initSignatureVerification(worker: Worker) {
    // ... existing code ...

    worker.onmessage = (e) => {
        const { id, valid } = e.data;
        const callback = callbacks.get(id);

        if (callback) {
            callbacks.delete(id);

            // Get the stored event and relay information
            const { event, relay, ndk } = eventContext.get(id) || {};
            eventContext.delete(id);

            if (valid) {
                verifiedSignatures.set(event.id, event.sig);
                callback(true);
                relay?.addValidatedEvent();
            } else {
                callback(false);
                // If invalid, report through the centralized method
                if (event && relay && ndk) {
                    ndk.reportInvalidSignature(event, relay);
                }
            }
        }
    };
}
```

### 5. Default Validation Ratio Function

#### 5.1. Implement a Default Algorithm

This would be part of the NDK class constructor in `ndk-core/src/ndk/index.ts`:

```typescript
public constructor(opts: NDKConstructorParams = {}) {
    // Existing constructor code

    this.initialValidationRatio = opts.initialValidationRatio || 1.0;
    this.lowestValidationRatio = opts.lowestValidationRatio || 0.1;
    this.autoBlacklistInvalidRelays = opts.autoBlacklistInvalidRelays || false;

    // Set a default validation ratio function if none is provided
    this.validationRatioFn = opts.validationRatioFn || this.defaultValidationRatioFn;
}

/**
 * Default function to calculate validation ratio based on historical validation results.
 * The more events validated successfully, the lower the ratio goes (down to the minimum).
 */
private defaultValidationRatioFn(relay: NDKRelay, validatedCount: number, nonValidatedCount: number): number {
    if (validatedCount < 10) return this.initialValidationRatio;

    // Calculate a logarithmically decreasing ratio that approaches the minimum
    // as more events are validated
    const totalEvents = validatedCount + nonValidatedCount;
    const trustFactor = Math.min(validatedCount / 100, 1); // Caps at 100 validated events

    const calculatedRatio = this.initialValidationRatio *
        (1 - trustFactor) +
        this.lowestValidationRatio * trustFactor;

    return Math.max(calculatedRatio, this.lowestValidationRatio);
}
```

### 6. Integration Points

#### 6.1. Update NDKConstructorParams Interface

In `ndk-core/src/ndk/index.ts`, update:

```typescript
export interface NDKConstructorParams {
    // Existing parameters

    /**
     * The signature verification validation ratio for new relays.
     * A value of 1.0 means verify all signatures, 0.5 means verify half, etc.
     * @default 1.0
     */
    initialValidationRatio?: number;

    /**
     * The lowest validation ratio any single relay can have.
     * Relays will have a sample of events verified based on this ratio.
     * When using this, you MUST listen for event:invalid-sig events
     * to handle invalid signatures and disconnect from evil relays.
     *
     * @default 0.1
     */
    lowestValidationRatio?: number;

    /**
     * A function that is invoked to calculate the validation ratio for a relay.
     * If not provided, a default algorithm will be used.
     */
    validationRatioFn?: NDKValidationRatioFn;

    /**
     * When true, automatically blacklist relays that provide events with invalid signatures.
     * A single invalid signature is enough to mark a relay as malicious.
     * @default false
     */
    autoBlacklistInvalidRelays?: boolean;
}
```

### 7. Documentation Updates

#### 7.1. Add Documentation to README.md and API Reference

For example:

````markdown
## Signature Verification Sampling

NDK includes support for signature verification sampling to improve performance while maintaining security.

### Security Model

The security model is based on the principle that **all relays must always send valid signatures**. A single invalid signature is sufficient evidence that a relay is malicious and should be blacklisted.

By using signature sampling, we can significantly reduce computational overhead while maintaining this security model. As a relay proves trustworthy by consistently providing valid signatures, we reduce the sampling rate, checking fewer signatures over time, down to a configurable minimum ratio.

If at any point an invalid signature is detected, the relay is immediately reported through the centralized `reportInvalidSignature` method, which emits an `event:invalid-sig` event and optionally blacklists the relay.

### Configuration

```typescript
const ndk = new NDK({
    // Verify 100% of signatures from new relays
    initialValidationRatio: 1.0,

    // Eventually drop to verifying only 10% of signatures from trusted relays
    lowestValidationRatio: 0.1,

    // Optional custom function to determine validation ratio
    validationRatioFn: (relay, validatedCount, nonValidatedCount) => {
        // Custom logic to determine ratio
        return Math.max(0.1, 1.0 - validatedCount / 1000);
    },

    // Automatically blacklist relays that send invalid signatures
    autoBlacklistInvalidRelays: true,
});

// Listen for invalid signature events
ndk.on("event:invalid-sig", (event, relay) => {
    console.log(`Relay ${relay.url} sent an event with invalid signature: ${event.id}`);
    // Custom handling...
});
```
````

````

## Implementation Steps

1. **First Phase: Core Implementation**
   - Enhance NDKRelay to track validation statistics
   - Implement `shouldValidateEvent()` method logic
   - Add `updateValidationRatio()` method
   - Implement default ratio calculation algorithm

2. **Second Phase: Centralized Invalid Signature Handling**
   - Implement the centralized `reportInvalidSignature` method in NDK
   - Update `event:invalid-sig` event to include relay information
   - Modify async signature verification to use centralized reporting

3. **Third Phase: Integration with Existing Code**
   - Update NDKSubscription's `eventReceived` method to use sampling
   - Wire up the blacklisting functionality
   - Update NDK constructor and interfaces

4. **Fourth Phase: Testing**
   - Create unit tests for ratio calculation
   - Test integration with different ratio configurations
   - Verify behavior with intentionally invalid signatures

5. **Fifth Phase: Documentation and Examples**
   - Update README and API documentation
   - Create examples for different use cases

## Testing Plan

### Utilizing NDK Test Utilities

The `ndk-test-utils` package provides several useful tools for testing our implementation:

1. **RelayMock**: We'll use this to simulate relays sending both valid and invalid signatures
2. **EventGenerator**: Helps create test events with controlled properties
3. **TestFixture**: Provides a complete test environment with mock relays and events
4. **TimeController**: Useful for testing time-dependent behavior in our ratio calculation

### Unit Tests

1. **Validation Ratio Calculation**
   ```typescript
   import { TestFixture, EventGenerator } from "@nostr-dev-kit/ndk/test";

   test('validation ratio decreases with successful validations', () => {
     const fixture = new TestFixture();
     const ndk = fixture.ndk;
     ndk.initialValidationRatio = 1.0;
     ndk.lowestValidationRatio = 0.1;

     const relay = new NDKRelay('wss://example.com', undefined, ndk);

     // Initial ratio should be 1.0
     expect(relay.shouldValidateEvent()).toBe(true);

     // Add 100 validated events using EventGenerator
     const eventGenerator = new EventGenerator();
     const events = eventGenerator.generateEvents(100); // Generate 100 valid events

     // Simulate validation
     for (const event of events) {
       relay.addValidatedEvent();
     }

     // Ratio should decrease but still be probabilistic
     // Run multiple checks to verify the ratio is roughly as expected
     let validationCount = 0;
     for (let i = 0; i < 1000; i++) {
       if (relay.shouldValidateEvent()) validationCount++;
     }

     // With 100 validated events, we expect the ratio to be lower than initial
     // but still above the minimum
     expect(validationCount).toBeGreaterThan(100); // should be more than minimum
     expect(validationCount).toBeLessThan(900); // should be less than initial
   });
````

2. **Custom Validation Function**

    ```typescript
    import { TestFixture } from "@nostr-dev-kit/ndk/test";

    test("custom validation function is applied", () => {
        // Creating a custom function that always returns 0.5
        const customFn = () => 0.5;

        const fixture = new TestFixture({
            ndkOptions: {
                initialValidationRatio: 1.0,
                lowestValidationRatio: 0.1,
                validationRatioFn: customFn,
            },
        });

        const relay = new NDKRelay("wss://example.com", undefined, fixture.ndk);

        // Validate multiple times to check probability is ~0.5
        let validationCount = 0;
        for (let i = 0; i < 1000; i++) {
            if (relay.shouldValidateEvent()) validationCount++;
        }

        // Should be roughly 50%
        expect(validationCount).toBeGreaterThan(400);
        expect(validationCount).toBeLessThan(600);
    });
    ```

### Integration Tests

1. **Invalid Signature Detection**

    ```typescript
    import { RelayMock, EventGenerator } from "@nostr-dev-kit/ndk/test";

    test("detects and reports invalid signatures", async () => {
        // Create NDK instance with test configuration
        const ndk = new NDK({ initialValidationRatio: 1.0 });

        // Create a mock relay
        const mockRelay = new RelayMock(ndk, { url: "wss://mock.com" });

        // Spy on reportInvalidSignature
        const reportSpy = jest.spyOn(ndk, "reportInvalidSignature");

        // Create event with invalid signature using EventGenerator
        const eventGenerator = new EventGenerator();
        const eventData = eventGenerator.generateEvent();

        // Modify signature to be invalid
        eventData.sig = "invalid-signature";

        // Create NDKEvent and subscription
        const event = new NDKEvent(ndk, eventData);
        const sub = new NDKSubscription(ndk, { kinds: [1] });

        // Process the event as if received from the relay
        sub.eventReceived(event, mockRelay);

        // Verify reportInvalidSignature was called with correct parameters
        expect(reportSpy).toHaveBeenCalledWith(expect.any(NDKEvent), mockRelay);

        // Verify the relay is considered malicious after a single invalid signature
        if (ndk.autoBlacklistInvalidRelays) {
            expect(ndk.blacklistRelayUrls).toContain(mockRelay.url);
        }
    });
    ```

2. **Event Emitting and Blacklisting Test**

    ```typescript
    import { RelayMock, EventGenerator } from "@nostr-dev-kit/ndk/test";

    test("emits event:invalid-sig event with relay and can blacklist", async () => {
        // Create NDK with auto blacklisting
        const ndk = new NDK({
            autoBlacklistInvalidRelays: true,
        });

        // Create mock relay
        const mockRelay = new RelayMock(ndk, { url: "wss://mock.com" });

        // Create listener for the event
        const listener = jest.fn();
        ndk.on("event:invalid-sig", listener);

        // Generate event
        const eventGenerator = new EventGenerator();
        const event = new NDKEvent(ndk, eventGenerator.generateEvent());

        // Trigger invalid signature report
        ndk.reportInvalidSignature(event, mockRelay);

        // Verify listener was called with correct args
        expect(listener).toHaveBeenCalledWith(event, mockRelay);

        // Verify relay was blacklisted
        expect(ndk.blacklistRelayUrls).toContain(mockRelay.url);
    });
    ```

3. **Testing with Time Control**

    ```typescript
    import { TestFixture, withTimeControl } from "@nostr-dev-kit/ndk/test";

    test(
        "ratio calculation over time",
        withTimeControl(async ({ advanceTime }) => {
            const fixture = new TestFixture();
            const ndk = fixture.ndk;
            ndk.initialValidationRatio = 1.0;
            ndk.lowestValidationRatio = 0.1;

            const relay = new NDKRelay("wss://example.com", undefined, ndk);

            // Add validated events over simulated time
            for (let i = 0; i < 5; i++) {
                relay.addValidatedEvent();
                // Advance time by 1 hour
                await advanceTime(60 * 60 * 1000);
            }

            // Check ratio is still high with just a few validations
            let validationCount = 0;
            for (let i = 0; i < 100; i++) {
                if (relay.shouldValidateEvent()) validationCount++;
            }

            // Should still be high with just 5 events
            expect(validationCount).toBeGreaterThan(80);

            // Add many more validated events
            for (let i = 0; i < 95; i++) {
                relay.addValidatedEvent();
            }

            // Advance time by 1 day
            await advanceTime(24 * 60 * 60 * 1000);

            // Check ratio has decreased significantly
            validationCount = 0;
            for (let i = 0; i < 100; i++) {
                if (relay.shouldValidateEvent()) validationCount++;
            }

            // Should now be much lower after 100 total validated events
            expect(validationCount).toBeLessThan(50);
            expect(validationCount).toBeGreaterThan(10); // But not below minimum
        }),
    );
    ```

4. **Testing Async Signature Verification**

    ```typescript
    import { RelayMock, EventGenerator } from "@nostr-dev-kit/ndk/test";

    test("centralizes invalid signature reporting from async verification", async () => {
        // Create NDK with async verification
        const worker = new Worker("path/to/signature-worker.js");
        const ndk = new NDK({
            signatureVerificationWorker: worker,
            autoBlacklistInvalidRelays: true,
        });

        // Create a mock relay
        const mockRelay = new RelayMock(ndk, { url: "wss://mock.com" });

        // Spy on reportInvalidSignature
        const reportSpy = jest.spyOn(ndk, "reportInvalidSignature");

        // Generate event with invalid signature
        const eventGenerator = new EventGenerator();
        const event = eventGenerator.generateEvent();
        event.sig = "invalid-signature";

        // Mock the worker verification process
        // This would normally be handled by the worker messaging
        const ndkEvent = new NDKEvent(ndk, event);
        ndkEvent.relay = mockRelay;

        // Simulate worker message for invalid signature
        // (In reality this would happen asynchronously)
        ndk.reportInvalidSignature(ndkEvent, mockRelay);

        // Verify reportInvalidSignature was called with correct parameters
        expect(reportSpy).toHaveBeenCalledWith(ndkEvent, mockRelay);

        // Verify relay was blacklisted
        expect(ndk.blacklistRelayUrls).toContain(mockRelay.url);
    });
    ```

## Conclusion

This implementation plan provides a comprehensive approach to signature verification sampling in NDK. By validating only a sample of signatures from each relay, we can significantly improve performance while maintaining security.

The centralized `reportInvalidSignature` method ensures consistent handling of invalid signatures, regardless of whether they are detected synchronously during event processing or asynchronously by a web worker. This maintains the security model where a single invalid signature is sufficient to identify a malicious relay.

By extending the existing `event:invalid-sig` event to include relay information, we maintain backward compatibility while providing the necessary context to identify and potentially blacklist malicious relays.

The implementation is flexible, allowing developers to configure the validation ratio parameters or provide their own custom ratio calculation function to suit their specific needs and threat models.
