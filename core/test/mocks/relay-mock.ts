import { EventEmitter } from "node:events";
import type { NDKEvent } from "../../src/events";
import { NDKRelayStatus } from "../../src/relay";
import type { NDKFilter, NDKSubscription } from "../../src/subscription";

interface RelayMockOptions {
    simulateDisconnect?: boolean;
    disconnectAfter?: number;
    connectionDelay?: number;
    autoConnect?: boolean;
    failNextPublish?: boolean;
}

/**
 * Mock Nostr relay for testing your application without real relay connections.
 *
 * Simulates a full Nostr relay with configurable behavior including connection delays,
 * disconnections, and publish failures. Perfect for testing your app's relay interaction
 * logic without network dependencies.
 *
 * @example
 * ```typescript
 * import { RelayMock } from '@nostr-dev-kit/ndk/test';
 *
 * // Create a mock relay
 * const relay = new RelayMock('wss://relay.example.com', {
 *   connectionDelay: 100,      // Simulate 100ms connection delay
 *   simulateDisconnect: true,  // Randomly disconnect
 *   disconnectAfter: 5000      // Disconnect after 5 seconds
 * });
 *
 * // Use it in your NDK instance
 * ndk.pool.relays.set(relay.url, relay);
 *
 * // Simulate events from relay
 * const event = await EventGenerator.createSignedTextNote('Hello!', alice.pubkey);
 * relay.simulateEvent(event);
 * relay.simulateEOSE();
 *
 * // Test publish failures
 * relay.failNextPublish = true;
 * await myApp.publishNote('This will fail');
 * ```
 */
export class RelayMock extends EventEmitter {
    public url: string;
    private _status: NDKRelayStatus = NDKRelayStatus.DISCONNECTED;
    public messageLog: Array<{ direction: "in" | "out"; message: string }> = [];
    private activeSubscriptions: Map<string, NDKSubscription> = new Map();
    public validatedEvents: number = 0;
    public nonValidatedEvents: number = 0;

    // Configurable behavior for testing
    public options: Required<RelayMockOptions>;

    constructor(url = "wss://mock.relay", options: RelayMockOptions = {}) {
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
    async connect(): Promise<void> {
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

    async disconnect(): Promise<void> {
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
            return;
        }

        this.messageLog.push({ direction: "out", message });

        try {
            const parsed = JSON.parse(message);
            const [type, ...rest] = parsed;

            if (type === "REQ") {
                const [subId, ...filters] = rest;
                // Find the subscription with this ID
                const _subscription = Array.from(this.activeSubscriptions.values()).find((sub) => sub.subId === subId);

                // Emit the subscription event
                this.emit("subscription", { id: subId, filters });
            } else if (type === "CLOSE") {
                const [subId] = rest;
                if (this.activeSubscriptions.has(subId)) {
                    this.activeSubscriptions.delete(subId);
                }
            }
        } catch (e) {
            console.error(`[RelayMock:${this.url}] Error processing message: ${e}`);
        }
    }

    async publish(event: NDKEvent): Promise<boolean> {
        if (this.options.failNextPublish) {
            this.options.failNextPublish = false;
            return false;
        }

        const eventData = await event.toNostrEvent();
        const message = JSON.stringify(["EVENT", eventData]);
        this.send(message);
        return true;
    }

    subscribe(subscription: NDKSubscription, filters: NDKFilter[]): void {
        // Use the subscription's subId if available, otherwise generate a random one
        const subId = subscription.subId || Math.random().toString(36).substring(2, 15);

        // Store the subscription with its ID for later reference
        this.activeSubscriptions.set(subId, subscription);

        // Send the REQ message
        const message = JSON.stringify(["REQ", subId, ...filters]);
        this.send(message);
    }

    // Method required by NDKSubscription
    shouldValidateEvent(): boolean {
        return true;
    }

    // Event tracking methods

    /**
     * Track the number of validated events (used in tests)
     */
    addValidatedEvent(): void {
        this.validatedEvents += 1;
    }

    /**
     * Track the number of non-validated events (used in tests)
     */
    addNonValidatedEvent(): void {
        this.nonValidatedEvents += 1;
    }

    // Simulation methods for testing

    /**
     * Simulate receiving a raw message
     */
    simulateReceiveMessage(message: string): void {
        this.messageLog.push({ direction: "in", message });
        this.emit("message", message);
    }

    /**
     * Simulate receiving an event
     */
    async simulateEvent(event: NDKEvent, subId?: string): Promise<void> {
        const eventData = await event.toNostrEvent();

        if (subId) {
            // If a subId is provided, only send to that subscription
            const subscription = this.activeSubscriptions.get(subId);
            if (subscription) {
                // Directly call the eventReceived method on the subscription
                subscription.eventReceived(event, this as any);

                // Also emit the raw message for completeness
                const message = JSON.stringify(["EVENT", subId, eventData]);
                this.simulateReceiveMessage(message);
            }
        } else {
            // Otherwise, send to all active subscriptions
            this.activeSubscriptions.forEach((subscription, id) => {
                // Directly call the eventReceived method on the subscription
                subscription.eventReceived(event, this as any);

                // Also emit the raw message for completeness
                const message = JSON.stringify(["EVENT", id, eventData]);
                this.simulateReceiveMessage(message);
            });
        }
    }

    /**
     * Simulate end of stored events
     */
    simulateEOSE(subId: string): void {
        const subscription = this.activeSubscriptions.get(subId);
        if (subscription) {
            // Directly call the eoseReceived method on the subscription
            subscription.eoseReceived(this as any);

            // Also emit the raw message for completeness
            const message = JSON.stringify(["EOSE", subId]);
            this.simulateReceiveMessage(message);
        }
    }

    /**
     * Simulate a NOTICE message from the relay
     */
    simulateNotice(message: string): void {
        const noticeMessage = JSON.stringify(["NOTICE", message]);
        this.simulateReceiveMessage(noticeMessage);
    }

    reset(): void {
        this.messageLog = [];
        this.activeSubscriptions.clear();
        this._status = NDKRelayStatus.DISCONNECTED;
        this.validatedEvents = 0;
        this.nonValidatedEvents = 0;
    }
}
