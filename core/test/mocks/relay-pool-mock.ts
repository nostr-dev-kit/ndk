import type { NDKEvent } from "src/events";
import type { NDKFilter } from "src/subscription";
import { RelayMock } from "./relay-mock";

/**
 * Mock relay pool for testing applications with multiple Nostr relays.
 *
 * Manages multiple mock relays and provides convenient methods to simulate
 * events across all or specific relays. Perfect for testing your app's
 * multi-relay behavior, redundancy, and relay selection logic.
 *
 * @example
 * ```typescript
 * import { RelayPoolMock, EventGenerator, UserGenerator } from '@nostr-dev-kit/ndk/test';
 *
 * const pool = new RelayPoolMock();
 * const ndk = new NDK({ explicitRelayUrls: [] });
 * ndk.pool = pool;
 *
 * // Add mock relays
 * pool.addMockRelay('wss://relay1.example.com');
 * pool.addMockRelay('wss://relay2.example.com', {
 *   connectionDelay: 200
 * });
 *
 * // Simulate event on all relays
 * const alice = await UserGenerator.getUser('alice', ndk);
 * const event = await EventGenerator.createSignedTextNote('Hello!', alice.pubkey);
 * pool.simulateEventOnAll(event);
 *
 * // Simulate event on specific relays
 * pool.simulateEventOn(['wss://relay1.example.com'], event);
 *
 * // Send EOSE to all relays
 * pool.simulateEOSEOnAll(subscriptionId);
 *
 * // Cleanup
 * pool.disconnectAll();
 * pool.resetAll();
 * ```
 */
export class RelayPoolMock {
    mockRelays: Map<string, RelayMock> = new Map();
    relays: Set<RelayMock> = new Set();
    private eventListeners: Map<string, Set<Function>> = new Map();
    private onceListeners: Map<string, Set<Function>> = new Map();

    addMockRelay(url: string, options = {}): RelayMock {
        const mockRelay = new RelayMock(url, options);
        this.mockRelays.set(url, mockRelay);
        this.relays.add(mockRelay);
        return mockRelay;
    }

    getMockRelay(url: string): RelayMock | undefined {
        return this.mockRelays.get(url);
    }

    addRelay(relay: RelayMock): void {
        this.relays.add(relay);
        this.mockRelays.set(relay.url, relay);
    }

    removeRelay(relay: RelayMock): void {
        this.relays.delete(relay);
        this.mockRelays.delete(relay.url);
    }

    simulateEventOnAll(event: NDKEvent): void {
        for (const relay of this.mockRelays.values()) {
            relay.simulateEvent(event);
        }
    }

    simulateEventOn(relayUrls: string[], event: NDKEvent): void {
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

    // Add this method to support the NDKSubscription implementation
    permanentAndConnectedRelays(): RelayMock[] {
        return Array.from(this.relays).filter((relay) => relay.status === 5); // CONNECTED
    }

    // Add this method to support the eoseReceived method in NDKSubscription
    connectedRelays(): RelayMock[] {
        return Array.from(this.relays).filter((relay) => relay.status === 5); // CONNECTED
    }

    // Add this method to support the NDKSubscription implementation
    getRelay(url: string, connect = false, createIfNotExists = false, _filters?: NDKFilter[]): RelayMock {
        let relay = this.mockRelays.get(url);

        if (!relay && createIfNotExists) {
            relay = this.addMockRelay(url);
        }

        if (!relay) {
            throw new Error(`Relay ${url} not found and createIfNotExists is false`);
        }

        if (connect && relay.status !== 2) {
            // CONNECTED
            relay.connect();
        }

        return relay;
    }

    // Add event listener support
    on(eventName: string, callback: Function): void {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, new Set());
        }
        this.eventListeners.get(eventName)?.add(callback);
    }

    // Add 'once' event listener support (required by NDK)
    once(eventName: string, callback: Function): void {
        if (!this.onceListeners.has(eventName)) {
            this.onceListeners.set(eventName, new Set());
        }

        // Create a wrapper that removes itself after first execution
        const wrappedCallback = (...args: any[]) => {
            callback(...args);

            // Remove the listener after execution
            this.onceListeners.get(eventName)?.delete(wrappedCallback);
        };

        this.onceListeners.get(eventName)?.add(wrappedCallback);

        // Also register in normal listeners for emit to find it
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, new Set());
        }
        this.eventListeners.get(eventName)?.add(wrappedCallback);
    }

    // Remove event listener
    off(eventName: string, callback: Function): void {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName)?.delete(callback);
        }

        if (this.onceListeners.has(eventName)) {
            this.onceListeners.get(eventName)?.delete(callback);
        }
    }

    // Trigger an event
    emit(eventName: string, ...args: any[]): void {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName)?.forEach((callback) => {
                callback(...args);
            });
        }
    }

    // Add useTemporaryRelay method (required by NDK)
    useTemporaryRelay(_relay: RelayMock, _filters?: NDKFilter[], _subscription?: any): void {
        // Mock implementation - no-op for testing
    }

    // Add blacklistRelayUrls property (required by outbox tracker)
    blacklistRelayUrls: Set<string> = new Set();
}
