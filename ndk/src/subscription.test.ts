import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import NDK, { NDKSubscription, NDKFilter, NDKKind, NDKEvent, NDKRelay, NDKRelaySet } from './index';
import { MockRelayPool } from '../../test/mocks/relay/MockRelayPool';
import { EventGenerator } from '../../test/mocks/events/EventGenerator';
import { expectEventToBeValid, expectEventsToMatch } from '../../test/assertions/eventAssertions';

describe('NDKSubscription', () => {
    let ndk: NDK;
    let pool: MockRelayPool;

    beforeEach(() => {
        pool = new MockRelayPool();
        ndk = new NDK({ explicitRelayUrls: [] });
        
        // Set up the EventGenerator with our NDK instance
        EventGenerator.setNDK(ndk);
        
        // Replace the relay pool with our mock
        // @ts-ignore - We're intentionally replacing the pool for testing
        ndk.pool = pool;

        // Add some mock relays
        pool.addMockRelay('wss://relay1.example.com');
        pool.addMockRelay('wss://relay2.example.com');
        pool.addMockRelay('wss://relay3.example.com');
    });

    afterEach(() => {
        pool.disconnectAll();
        pool.resetAll();
    });

    it(
        'should receive events matching the filter',
        async () => {
            // Create test events
            const event1 = await EventGenerator.createSignedTextNote('Hello world #1');
            const event2 = await EventGenerator.createSignedTextNote('Hello world #2');
            const event3 = await EventGenerator.createSignedTextNote('Hello world #3');

            console.log(`[Test] Created test events: ${event1.id}, ${event2.id}, ${event3.id}`);

            // Define filter
            const filter: NDKFilter = { kinds: [NDKKind.Text] };

            // Get the first relay
            const relaysArray = Array.from(pool.relays);
            const mockRelay = relaysArray[0];
            const relaySet = new NDKRelaySet(new Set([mockRelay as unknown as NDKRelay]), ndk);
            // Create subscription with explicit subId
            const subId = 'test-subscription-1';
            const sub = new NDKSubscription(ndk, filter, { 
                subId,
                skipVerification: true, // Skip verification to simplify test
                skipValidation: true    // Skip validation to simplify test
            }, relaySet);
            console.log(`[Test] Created subscription with ID: ${sub.subId}`);

            // Track received events
            const receivedEvents: NDKEvent[] = [];
            let eoseReceived = false;

            sub.on('event', (event: NDKEvent) => {
                console.log(`[Test] Received event: ${event.id}`);
                receivedEvents.push(event);
            });

            sub.on('eose', () => {
                console.log('[Test] EOSE received');
                eoseReceived = true;
            });

            // Start the subscription first
            console.log('[Test] Starting subscription');
            await sub.start();
            
            // Manually simulate events directly to the subscription
            console.log('[Test] Manually simulating events');
            
            // Directly call eventReceived on the subscription
            console.log('[Test] Simulating event1');
            mockRelay.simulateEvent(event1, sub.subId!);
            
            console.log('[Test] Simulating event2');
            mockRelay.simulateEvent(event2, sub.subId!);
            
            console.log('[Test] Simulating event3');
            mockRelay.simulateEvent(event3, sub.subId!);
            
            // Simulate EOSE
            console.log('[Test] Simulating EOSE');
            mockRelay.simulateEOSE(sub.subId!);

            // Verify results
            console.log(`[Test] Received ${receivedEvents.length} events, EOSE received: ${eoseReceived}`);
            expect(receivedEvents.length).toEqual(3);
            expect(eoseReceived).toBe(true);
            expectEventToBeValid(receivedEvents[0]);
            expectEventsToMatch(receivedEvents[0], event1);
            expectEventsToMatch(receivedEvents[1], event2);
            expectEventsToMatch(receivedEvents[2], event3);
        }
    );

    it(
        'should close subscription on EOSE when requested',
        async () => {
            // Create test events
            const event = await EventGenerator.createSignedTextNote('Test event');
            console.log(`[Test] Created test event: ${event.id}`);

            // Define filter
            const filter: NDKFilter = { kinds: [NDKKind.Text] };

            // Get the first relay
            const relaysArray = Array.from(pool.relays);
            const mockRelay = relaysArray[0];

            const relaySet = new NDKRelaySet(new Set([mockRelay as unknown as NDKRelay]), ndk);
            
            // Create subscription with closeOnEose=true and explicit subId
            const sub = new NDKSubscription(ndk, filter, { 
                closeOnEose: true,
                subId: 'test-subscription-2',
                skipVerification: true, // Skip verification to simplify test
                skipValidation: true    // Skip validation to simplify test
            }, relaySet);
            console.log(`[Test] Created subscription with ID: ${sub.subId} and closeOnEose=true`);

            // Track events
            let eventReceived = false;
            let eoseReceived = false;
            let closedReceived = false;

            sub.on('event', () => {
                console.log('[Test] Event received');
                eventReceived = true;
            });
            
            sub.on('eose', () => {
                console.log('[Test] EOSE received');
                eoseReceived = true;
            });
            
            sub.on('close', () => {
                console.log('[Test] Close received');
                closedReceived = true;
            });

            // Start the subscription first
            console.log('[Test] Starting subscription');
            await sub.start();
            
            // Directly call eventReceived on the subscription
            console.log('[Test] Simulating event');
            mockRelay.simulateEvent(event, sub.subId!);
            
            // Simulate EOSE
            mockRelay.simulateEOSE(sub.subId!);

            // Verify results
            console.log(`[Test] Event received: ${eventReceived}, EOSE received: ${eoseReceived}, Closed: ${closedReceived}`);
            expect(eventReceived).toBe(true);
            expect(eoseReceived).toBe(true);
            expect(closedReceived).toBe(true);
        }
    );
}); 