import type { NDKEventId } from "../events/index.js";
import type { NDKRelay } from "../relay/index.js";
import type { NDKSubscription } from "./index.js";
import type debug from "debug";

export type NDKSubscriptionId = string;

/**
 * This class monitors active subscriptions.
 */
export class NDKSubscriptionManager {
    public subscriptions: Map<NDKSubscriptionId, NDKSubscription>;
    public seenEvents = new Map<NDKEventId, NDKRelay[]>();
    private debug: debug.Debugger;

    constructor(debug: debug.Debugger) {
        this.subscriptions = new Map();
        this.debug = debug.extend("sub-manager");
    }

    public add(sub: NDKSubscription) {
        this.subscriptions.set(sub.internalId, sub);

        sub.on("close", () => {
            this.subscriptions.delete(sub.internalId);
        });
    }

    public seenEvent(eventId: NDKEventId, relay: NDKRelay) {
        const current = this.seenEvents.get(eventId) || [];
        current.push(relay);
        this.seenEvents.set(eventId, current);
    }
}
