import { NDKFilter, NDKEvent, NDKRelayStatus, NDKSubscription } from "../../ndk/src";
import { MockRelayPool } from "../mocks/relay/MockRelayPool";

// Helper function to generate a UUID
function generateUUID(): string {
    return Math.random().toString(36).substring(2, 15);
}

export class SubscriptionScenario {
    private subId: string;
    private events: NDKEvent[] = [];
    private eoseDelay: number = 0;
    private subscription?: NDKSubscription;

    constructor(
        private pool: MockRelayPool,
        private filter: NDKFilter
    ) {
        this.subId = generateUUID();
        console.log(`[SubscriptionScenario] Created with generated ID: ${this.subId}`);
    }

    withEvents(events: NDKEvent[]): SubscriptionScenario {
        this.events = events;
        console.log(`[SubscriptionScenario] Set ${events.length} events`);
        return this;
    }

    withEOSEDelay(delay: number): SubscriptionScenario {
        this.eoseDelay = delay;
        console.log(`[SubscriptionScenario] Set EOSE delay: ${delay}ms`);
        return this;
    }

    setSubscription(subscription: NDKSubscription): SubscriptionScenario {
        this.subscription = subscription;
        console.log(`[SubscriptionScenario] Set subscription with ID: ${subscription.subId}`);
        return this;
    }

    async execute(): Promise<void> {
        console.log(`[SubscriptionScenario] Executing scenario`);

        // Connect all relays
        // Manually connect each relay in the pool
        for (const relay of this.pool.relays) {
            if (relay.status !== NDKRelayStatus.CONNECTED) {
                relay.connect();
            }
        }
        console.log(`[SubscriptionScenario] All relays connected`);

        // Wait for subscription to be fully initialized - increased to 300ms
        console.log(
            `[SubscriptionScenario] Waiting 300ms for subscription to be fully initialized`
        );
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Get the actual subscription ID from the subscription if available
        let actualSubId = this.subId;
        if (this.subscription && this.subscription.subId) {
            actualSubId = this.subscription.subId;
            console.log(`[SubscriptionScenario] Using subscription's subId: ${actualSubId}`);
        } else {
            console.log(`[SubscriptionScenario] Using generated subId: ${actualSubId}`);
        }

        // Log the active subscriptions on each relay
        this.pool.relays.forEach((relay) => {
            console.log(`[SubscriptionScenario] Checking subscriptions on relay ${relay.url}`);

            const activeSubscriptions = Array.from(
                (relay as any).activeSubscriptions?.keys() || []
            );
            console.log(
                `[SubscriptionScenario] Active subscriptions on relay ${relay.url}: ${activeSubscriptions.join(", ")}`
            );

            const hasSubscription = activeSubscriptions.includes(actualSubId);
            console.log(
                `[SubscriptionScenario] Relay has our subscription: ${hasSubscription ? "YES" : "NO"}`
            );

            if (!hasSubscription) {
                console.log(
                    `[SubscriptionScenario] WARNING: Relay ${relay.url} does not have our subscription ${actualSubId}`
                );
            }
        });

        // Send events
        console.log(
            `[SubscriptionScenario] Sending ${this.events.length} events for subId: ${actualSubId}`
        );
        for (const event of this.events) {
            console.log(
                `[SubscriptionScenario] Simulating event: ${event.id} for subId: ${actualSubId}`
            );
            this.pool.relays.forEach((relay) => {
                console.log(
                    `[SubscriptionScenario] Sending event ${event.id} to relay ${relay.url}`
                );
                relay.simulateEvent(event, actualSubId);
            });
            // Add a small delay between events to ensure they're processed in order
            await new Promise((resolve) => setTimeout(resolve, 50)); // Increased from 10ms to 50ms
        }

        // Send EOSE after delay
        if (this.eoseDelay > 0) {
            console.log(
                `[SubscriptionScenario] Will send EOSE after ${this.eoseDelay}ms for subId: ${actualSubId}`
            );
            setTimeout(() => {
                console.log(`[SubscriptionScenario] Sending EOSE for subId: ${actualSubId}`);
                this.pool.relays.forEach((relay) => {
                    console.log(`[SubscriptionScenario] Sending EOSE to relay ${relay.url}`);
                    relay.simulateEOSE(actualSubId);
                });
            }, this.eoseDelay);
        } else {
            console.log(
                `[SubscriptionScenario] Sending EOSE immediately for subId: ${actualSubId}`
            );
            this.pool.relays.forEach((relay) => {
                console.log(`[SubscriptionScenario] Sending EOSE to relay ${relay.url}`);
                relay.simulateEOSE(actualSubId);
            });
        }
    }
}
