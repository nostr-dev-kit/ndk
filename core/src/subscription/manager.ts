import { matchFilters, type VerifiedEvent } from "nostr-tools";
import { LRUCache } from "typescript-lru-cache";
import type { NDKEventId, NostrEvent } from "../events/index.js";
import type { NDKRelay } from "../relay/index.js";
import type { NDKSubscription } from "./index.js";

export type NDKSubscriptionId = string;

/**
 * This class monitors active subscriptions.
 */
export class NDKSubscriptionManager {
    public subscriptions: Map<NDKSubscriptionId, NDKSubscription>;

    // Use LRU cache instead of unbounded Map to prevent memory leaks
    public seenEvents = new LRUCache<NDKEventId, NDKRelay[]>({
        maxSize: 10000, // Keep last 10k events
        entryExpirationTimeInMS: 5 * 60 * 1000, // 5 minutes
    });

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
        if (!current.some((r) => r.url === relay.url)) {
            current.push(relay);
        }
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

        // First pass: Filter matching
        for (const sub of subscriptions) {
            if (matchFilters(sub.filters, event as VerifiedEvent)) {
                matchingSubs.push(sub);
            }
        }

        // Second pass: Relay provenance check for exclusive subscriptions
        for (const sub of matchingSubs) {
            if (sub.exclusiveRelay && sub.relaySet) {
                let shouldAccept = false;

                if (optimisticPublish) {
                    // Optimistic publishes are accepted if the subscription allows them
                    shouldAccept = !sub.skipOptimisticPublishEvent;
                } else if (!relay) {
                    // Event from cache - check if any of the event's known relays
                    // are in the subscription's relaySet
                    const eventOnRelays = this.seenEvents.get(event.id!) || [];
                    shouldAccept = eventOnRelays.some((r) => sub.relaySet!.relays.has(r));
                } else {
                    // Live event from a relay - check if the relay is in the subscription's relaySet
                    shouldAccept = sub.relaySet.relays.has(relay);
                }

                if (!shouldAccept) {
                    // Optionally log that an exclusive subscription rejected an event
                    sub.debug.extend("exclusive-relay")(
                        "Rejected event %s from %s (relay not in exclusive set)",
                        event.id,
                        relay?.url || (optimisticPublish ? "optimistic" : "cache"),
                    );
                    continue; // Skip this subscription
                }
            }

            // Deliver the event to the subscription
            sub.eventReceived(event, relay, false, optimisticPublish);
        }
    }
}
