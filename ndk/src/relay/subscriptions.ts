import { Relay, Sub } from "nostr-tools";
import { NDKRelay } from ".";
import { NDKSubscription } from "../subscription";
import { NDKFilterGroupingId, calculateGroupableId } from "../subscription/grouping";
import { NDKRelayFilters } from "./filter";
import { NDKEvent, NostrEvent } from "../events";
import { generateSubId } from "../subscription/utils";
import { NDKRelayConnectivity } from "./connectivity";

type NDKGroupedFilters = {
    filters: NDKRelayFilters[],
    subscriptions: NDKSubscription[],
};

/**
 * @ignore
 */
export class NDKRelaySubscriptions {
    private ndkRelay: NDKRelay;
    private delayedItems: Map<NDKFilterGroupingId, NDKGroupedFilters> = new Map();
    private debug: debug.Debugger;
    private groupingDebug: debug.Debugger;
    private conn: NDKRelayConnectivity;

    /**
     * Active subscriptions this relay is connected to
     */
    public activeSubscriptions = new Set<NDKSubscription>();

    public constructor(ndkRelay: NDKRelay) {
        this.ndkRelay = ndkRelay;
        this.conn = ndkRelay.connectivity;
        this.debug = ndkRelay.debug.extend("subscriptions");
        this.groupingDebug = ndkRelay.debug.extend("grouping");
    }

    public subscribe(
        subscription: NDKSubscription,
        filters: NDKRelayFilters,
    ): void {
        const filterGroupableId = calculateGroupableId(filters);

        if (!filterGroupableId) {
            this.groupingDebug("No groupable ID for filters", filters);
            // this.executeSubscription(subscription, filters);
            return;
        }

        if (!subscription.isGroupable() || !filterGroupableId) {
            // this.debug
            // this.executeSubscription(subscription, filters);
            return;
        }

        const delayedItem = this.delayedItems.get(filterGroupableId);

        if (!delayedItem) {
            this.delayedItems.set(filterGroupableId, {
                filters: [filters],
                subscriptions: [subscription],
            });
        } else {
            delayedItem.filters.push(filters);
            delayedItem.subscriptions.push(subscription);
        }

        setTimeout(() => {
            this.executeGroup(filterGroupableId);
        }, subscription.opts.groupableDelay);
    }

    /**
     * Executes a delayed subscription via its groupable ID.
     * @param groupableId
     */
    private executeGroup(groupableId: NDKFilterGroupingId) {
        const delayedItem = this.delayedItems.get(groupableId);
        this.delayedItems.delete(groupableId);

        if (delayedItem) {
        }
    }

    /**
     * Executes one or more subscriptions.
     *
     * When there are more than one subscription, results
     * will be sent to the right subscription
     */
    private executeSubscriptions(
        subscriptions: NDKSubscription[],
        filters: NDKRelayFilters
    ): Sub {
        const subId = generateSubId(subscriptions, filters);
        const sub = this.conn.relay.sub(filters, { id: subId });
        this.debug(`Subscribed to ${JSON.stringify(filters)}`);

        // sub.on("event", (event: NostrEvent) => {
        //     const e = new NDKEvent(undefined, event);
        //     e.relay = this;
        //     subscription.eventReceived(e, this);
        // });

        // sub.on("eose", () => {
        //     subscription.eoseReceived(this);
        // });

        // const unsub = sub.unsub;
        // sub.unsub = () => {
        //     this.debug(`Unsubscribing from ${JSON.stringify(filters)}`);
        //     this.activeSubscriptions.delete(subscription);
        //     unsub();
        // };

        // this.activeSubscriptions.add(subscription);
        // subscription.on("close", () => {
        //     this.activeSubscriptions.delete(subscription);
        // });

        return sub;
    }
}