import { EventEmitter } from "node:events";
import type { NDKEvent, NDKFilter, NDKRelayStatus, NDKSubscription } from "@nostr-dev-kit/ndk";

interface RelayMockOptions {
    simulateDisconnect?: boolean;
    disconnectAfter?: number;
    connectionDelay?: number;
    autoConnect?: boolean;
    failNextPublish?: boolean;
}

/**
 * Mock implementation of NDK Relay for testing purposes
 */
export class RelayMock extends EventEmitter {
    public url: string;
    private _status: NDKRelayStatus = 0; // DISCONNECTED
    public messageLog: Array<{ direction: "in" | "out"; message: string }> = [];
    private activeSubscriptions: Map<string, NDKSubscription> = new Map();

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
        this._status = 1; // CONNECTING

        if (this.options.connectionDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, this.options.connectionDelay));
        }

        this._status = 2; // CONNECTED
        this.emit("connect");

        if (this.options.simulateDisconnect) {
            setTimeout(() => {
                this._status = 0; // DISCONNECTED
                this.emit("disconnect");
            }, this.options.disconnectAfter);
        }
    }

    async disconnect(): Promise<void> {
        this._status = 3; // DISCONNECTING
        await Promise.resolve();
        this._status = 0; // DISCONNECTED
        this.emit("disconnect");
    }

    get status(): NDKRelayStatus {
        return this._status;
    }

    send(message: string): void {
        if (this.status !== 2) {
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

    // Additional methods for testing
    simulateReceiveMessage(message: string): void {
        this.messageLog.push({ direction: "in", message });
        this.emit("message", message);
    }

    /**
     * Simulate an event being received by a subscription
     */
    async simulateEvent(event: NDKEvent, subId?: string): Promise<void> {
        const eventData = await event.toNostrEvent();

        if (subId) {
            // If a subscription ID is provided, only send to that subscription
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

    /**
     * Reset the mock relay state
     */
    reset(): void {
        this.messageLog = [];
        this.activeSubscriptions.clear();
        this._status = 0; // DISCONNECTED
    }
}
