import { type VerifiedEvent, matchFilters } from "nostr-tools";
import type { NDKEventId, NostrEvent } from "../events/index.js";
import type { NDKRelay } from "../relay/index.js";
import type { NDKSubscription } from "./index.js";

export type NDKSubscriptionId = string;

/**
 * This class monitors active subscriptions.
 */
export class NDKSubscriptionManager {
    public subscriptions: Map<NDKSubscriptionId, NDKSubscription>;
    public seenEvents = new Map<NDKEventId, NDKRelay[]>();

    constructor() {
        this.subscriptions = new Map();
    }

    public add(sub: NDKSubscription) {
        this.subscriptions.set(sub.internalId, sub);

        if (sub.onStopped) {
        }

        sub.onStopped = () => {
            this.subscriptions.delete(sub.internalId);
        };

        sub.on("close", () => {
            this.subscriptions.delete(sub.internalId);
        });
    }

    public seenEvent(eventId: NDKEventId, relay: NDKRelay) {
        const current = this.seenEvents.get(eventId) || [];
        current.push(relay);
        this.seenEvents.set(eventId, current);
    }

    /**
     * Whenever an event comes in, this function is called.
     * This function matches the received event against all the
     * known (i.e. active) NDKSubscriptions, and if it matches,
     * it sends the event to the subscription.
     *
     * This is the single place in the codebase that matches
     * incoming events with parties interested in the event.
     *
     * This is also what allows for reactivity in NDK apps, such that
     * whenever an active subscription receives an event that some
     * other active subscription would want to receive, both receive it.
     *
     * TODO This also allows for subscriptions that overlap in meaning
     * to be collapsed into one.
     *
     * I.e. if a subscription with filter: kinds: [1], authors: [alice]
     * is created and EOSEs, and then a subsequent subscription with
     * kinds: [1], authors: [alice] is created, once the second subscription
     * EOSEs we can safely close it, increment its refCount and close it,
     * and when the first subscription receives a new event from Alice this
     * code will make the second subscription receive the event even though
     * it has no active subscription on a relay.
     * @param event Raw event received from a relay
     * @param relay Relay that sent the event
     * @param optimisticPublish Whether the event is coming from an optimistic publish
     */
    public dispatchEvent(event: NostrEvent, relay?: NDKRelay, optimisticPublish = false) {
        if (relay) this.seenEvent(event.id!, relay);

        const subscriptions = this.subscriptions.values();
        const matchingSubs = [];

        for (const sub of subscriptions) {
            if (matchFilters(sub.filters, event as VerifiedEvent)) {
                matchingSubs.push(sub);
            }
        }

        for (const sub of matchingSubs) {
            sub.eventReceived(event, relay, false, optimisticPublish);
        }
    }
}
