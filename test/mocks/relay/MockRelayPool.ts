import { NDKEvent, NDKRelay, NDKRelayStatus, NDKFilter } from "../../../ndk/src";
import { MockRelay } from "./MockRelay";

export class MockRelayPool {
    mockRelays: Map<string, MockRelay> = new Map();
    relays: Set<MockRelay> = new Set();
    private eventListeners: Map<string, Set<Function>> = new Map();

    constructor() {
        // Initialize the mock relay pool
    }

    addMockRelay(url: string, options = {}): MockRelay {
        const mockRelay = new MockRelay(url, options);
        this.mockRelays.set(url, mockRelay);
        this.relays.add(mockRelay);
        return mockRelay;
    }

    getMockRelay(url: string): MockRelay | undefined {
        return this.mockRelays.get(url);
    }

    addRelay(relay: MockRelay): void {
        this.relays.add(relay);
        this.mockRelays.set(relay.url, relay);
    }

    removeRelay(relay: MockRelay): void {
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
    permanentAndConnectedRelays(): MockRelay[] {
        return Array.from(this.relays).filter((relay) => relay.status === NDKRelayStatus.CONNECTED);
    }

    // Add this method to support the eoseReceived method in NDKSubscription
    connectedRelays(): MockRelay[] {
        return Array.from(this.relays).filter((relay) => relay.status === NDKRelayStatus.CONNECTED);
    }

    // Add this method to support the NDKSubscription implementation
    getRelay(
        url: string,
        connect: boolean = false,
        createIfNotExists: boolean = false,
        _filters?: NDKFilter[]
    ): MockRelay {
        let relay = this.mockRelays.get(url);

        if (!relay && createIfNotExists) {
            relay = this.addMockRelay(url);
        }

        if (!relay) {
            throw new Error(`Relay ${url} not found and createIfNotExists is false`);
        }

        if (connect && relay.status !== NDKRelayStatus.CONNECTED) {
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

    // Remove event listener
    off(eventName: string, callback: Function): void {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName)?.delete(callback);
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
}
