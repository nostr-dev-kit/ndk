import { EventEmitter } from "events";
import { NDKRelayStatus, NDKEvent, NDKFilter, NDKSubscription } from "../../../ndk/src";

interface MockRelayOptions {
    simulateDisconnect?: boolean;
    disconnectAfter?: number;
    connectionDelay?: number;
    autoConnect?: boolean;
    failNextPublish?: boolean;
}

// We're implementing a mock, not a full NDKRelay
export class MockRelay extends EventEmitter {
    public url: string;
    private _status: NDKRelayStatus = NDKRelayStatus.DISCONNECTED;
    public messageLog: Array<{ direction: "in" | "out"; message: string }> = [];
    private activeSubscriptions: Map<string, NDKSubscription> = new Map();

    // Configurable behavior for testing
    public options: Required<MockRelayOptions>;

    constructor(url: string, options: MockRelayOptions = {}) {
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
            console.log(`[MockRelay:${this.url}] Cannot send message - relay not connected`);
            return;
        }

        console.log(`[MockRelay:${this.url}] Sending message: ${message}`);

        try {
            const parsed = JSON.parse(message);
            const [type, ...rest] = parsed;

            if (type === "REQ") {
                const [subId, ...filters] = rest;
                console.log(`[MockRelay:${this.url}] Processing REQ for subId: ${subId}`);

                // Find the subscription with this ID
                const subscription = Array.from(this.activeSubscriptions.values()).find(
                    (sub) => sub.subId === subId
                );

                if (subscription) {
                    console.log(
                        `[MockRelay:${this.url}] Found subscription for REQ with ID: ${subId}`
                    );
                    // The subscription is already registered, just update the filters
                } else {
                    console.log(
                        `[MockRelay:${this.url}] No subscription found for REQ with ID: ${subId}`
                    );
                    // This is a new subscription request without a subscription object
                    // This shouldn't happen in normal operation, but we'll handle it anyway
                }

                // Emit the subscription event
                this.emit("subscription", { id: subId, filters });
            } else if (type === "CLOSE") {
                const [subId] = rest;
                console.log(`[MockRelay:${this.url}] Processing CLOSE for subId: ${subId}`);

                if (this.activeSubscriptions.has(subId)) {
                    console.log(`[MockRelay:${this.url}] Removing subscription: ${subId}`);
                    this.activeSubscriptions.delete(subId);
                } else {
                    console.log(
                        `[MockRelay:${this.url}] No subscription found to close with ID: ${subId}`
                    );
                }
            } else if (type === "EVENT") {
                console.log(`[MockRelay:${this.url}] Processing EVENT message`);
                // Handle event publishing
            }
        } catch (e) {
            console.error(`[MockRelay:${this.url}] Error processing message: ${e}`);
        }
    }

    async publish(event: NDKEvent): Promise<boolean> {
        if (this.options.failNextPublish) {
            this.options.failNextPublish = false;
            return false;
        }

        const message = JSON.stringify(["EVENT", event.rawEvent()]);
        this.send(message);
        return true;
    }

    subscribe(subscription: NDKSubscription, filters: NDKFilter[]): void {
        // Check if the subscription has a subId
        if (!subscription.subId) {
            console.warn(`[MockRelay:${this.url}] Subscription has no subId, generating one`);
        }

        // Use the subscription's subId if available, otherwise generate a random one
        const subId = subscription.subId || Math.random().toString(36).substring(2, 15);

        console.log(`[MockRelay:${this.url}] Subscribing with ID: ${subId}`);

        // Store the subscription with its ID for later reference
        this.activeSubscriptions.set(subId, subscription);

        // Log the subscription action
        console.log(
            `[MockRelay:${this.url}] Added subscription ${subId}, active subscriptions: ${this.activeSubscriptions.size}`
        );

        // Send the REQ message
        const message = JSON.stringify(["REQ", subId, ...filters]);
        this.send(message);
    }

    // Additional methods for testing
    simulateReceiveMessage(message: string): void {
        this.messageLog.push({ direction: "in", message });
        this.emit("message", message);
    }

    /**
     * Simulate an event being received by a subscription
     * @param event - The event to simulate
     * @param subId - The subscription ID to send the event to, if not provided, the event will be sent to all subscriptions
     */
    simulateEvent(event: NDKEvent, subId?: string): void {
        console.log(
            `[MockRelay:${this.url}] Simulating event ${event.id} for subscription ${subId || "all"}`
        );

        if (subId) {
            // If a subscription ID is provided, only send to that subscription
            const subscription = this.activeSubscriptions.get(subId);
            if (subscription) {
                console.log(
                    `[MockRelay:${this.url}] Found subscription ${subId}, sending event ${event.id}`
                );

                try {
                    // Directly call the eventReceived method on the subscription
                    subscription.eventReceived(event, this as any);
                    console.log(
                        `[MockRelay:${this.url}] Successfully sent event ${event.id} to subscription ${subId}`
                    );

                    // Also emit the raw message for completeness
                    const message = JSON.stringify(["EVENT", subId, event.rawEvent()]);
                    this.simulateReceiveMessage(message);
                } catch (error) {
                    console.error(
                        `[MockRelay:${this.url}] Error sending event to subscription ${subId}:`,
                        error
                    );
                }
            } else {
                console.log(`[MockRelay:${this.url}] No subscription found for ID: ${subId}`);
                console.log(
                    `[MockRelay:${this.url}] Active subscriptions: ${Array.from(this.activeSubscriptions.keys()).join(", ")}`
                );
            }
        } else {
            // Otherwise, send to all active subscriptions
            console.log(`[MockRelay:${this.url}] Sending event ${event.id} to all subscriptions`);
            if (this.activeSubscriptions.size === 0) {
                console.log(`[MockRelay:${this.url}] No active subscriptions to send event to`);
            }

            this.activeSubscriptions.forEach((subscription, id) => {
                console.log(`[MockRelay:${this.url}] Sending event to subscription ${id}`);

                try {
                    // Directly call the eventReceived method on the subscription
                    subscription.eventReceived(event, this as any);
                    console.log(
                        `[MockRelay:${this.url}] Successfully sent event ${event.id} to subscription ${id}`
                    );

                    // Also emit the raw message for completeness
                    const message = JSON.stringify(["EVENT", id, event.rawEvent()]);
                    this.simulateReceiveMessage(message);
                } catch (error) {
                    console.error(
                        `[MockRelay:${this.url}] Error sending event to subscription ${id}:`,
                        error
                    );
                }
            });
        }
    }

    simulateEOSE(subId: string): void {
        console.log(`[MockRelay:${this.url}] Simulating EOSE for subscription ${subId}`);

        const subscription = this.activeSubscriptions.get(subId);
        if (subscription) {
            console.log(`[MockRelay:${this.url}] Found subscription ${subId}, sending EOSE`);

            try {
                // Directly call the eoseReceived method on the subscription
                subscription.eoseReceived(this as any);
                console.log(
                    `[MockRelay:${this.url}] Successfully sent EOSE to subscription ${subId}`
                );

                // Also emit the raw message for completeness
                const message = JSON.stringify(["EOSE", subId]);
                this.simulateReceiveMessage(message);

                // If the subscription has closeOnEose set, we should close it
                if (subscription.opts?.closeOnEose) {
                    console.log(
                        `[MockRelay:${this.url}] Subscription ${subId} has closeOnEose set, closing it`
                    );
                    this.activeSubscriptions.delete(subId);

                    // Send a CLOSED message
                    const closedMessage = JSON.stringify(["CLOSED", subId, "normal"]);
                    this.simulateReceiveMessage(closedMessage);
                }
            } catch (error) {
                console.error(
                    `[MockRelay:${this.url}] Error sending EOSE to subscription ${subId}:`,
                    error
                );
            }
        } else {
            console.log(`[MockRelay:${this.url}] No subscription found for ID: ${subId}`);
            console.log(
                `[MockRelay:${this.url}] Active subscriptions: ${Array.from(this.activeSubscriptions.keys()).join(", ")}`
            );
        }
    }

    simulateNotice(message: string): void {
        const notice = JSON.stringify(["NOTICE", message]);
        this.simulateReceiveMessage(notice);
    }

    reset(): void {
        console.log(`[MockRelay ${this.url}] Resetting relay`);
        this.messageLog = [];
        this.activeSubscriptions.clear();
        this.options.failNextPublish = false;
    }

    shouldValidateEvent = () => true;
    addValidatedEvent = () => {};
    addNonValidatedEvent = () => {};
}
