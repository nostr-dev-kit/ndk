import { Relay, Sub, matchFilter } from "nostr-tools";
import { NDKRelay } from ".";
import { NDKFilter, NDKSubscription } from "../subscription";
import { NDKFilterGroupingId, calculateGroupableId, mergeFilters } from "../subscription/grouping";
import { NDKRelayFilters } from "./filter";
import { NDKEvent, NostrEvent } from "../events";
import { generateSubId } from "../subscription/utils";
import { NDKRelayConnectivity } from "./connectivity";

/**
 * Maintains an association of which filters belong to which subscription
 * as sent to this particular relay.
 */
class NDKRelaySubscriptionFilters {
    public subscription: NDKSubscription;
    public filters: NDKFilter[] = [];

    public constructor(subscription: NDKSubscription, filters: NDKFilter[]) {
        this.subscription = subscription;
        this.filters = filters;
    }

    public eventReceived(event: NDKEvent) {
        if (!this.eventMatchesLocalFilter(event)) return;
        this.subscription.emit("event", event);
    }

    private eventMatchesLocalFilter(
        event: NDKEvent,
    ): boolean {
        const rawEvent = event.rawEvent();
        return this.filters.some((filter) => matchFilter(filter, rawEvent as any));
    }
}

/**
 * @ignore
 */
export class NDKRelaySubscriptions {
    private ndkRelay: NDKRelay;
    private delayedItems: Map<NDKFilterGroupingId, NDKRelaySubscriptionFilters[]> = new Map();
    private delayedTimers: Map<NDKFilterGroupingId, number[]> = new Map();

    /**
     * Active subscriptions this relay is connected to
     */
    private activeSubscriptions: Map<Sub, NDKRelaySubscriptionFilters[]> = new Map();
    private debug: debug.Debugger;
    private groupingDebug: debug.Debugger;
    private conn: NDKRelayConnectivity;

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

        if (!filterGroupableId || !subscription.isGroupable()) {
            this.groupingDebug("No groupable ID for filters", filters);
            this.executeSubscriptions(
                [new NDKRelaySubscriptionFilters(subscription, filters)],
                filters
            );
            return;
        }

        const delayedItem = this.delayedItems.get(filterGroupableId);
        const subscriptionFilters = new NDKRelaySubscriptionFilters(subscription, filters);

        if (!delayedItem) {
            // this.debug("New delayed subscription with ID", filterGroupableId, filters);
            this.delayedItems.set(filterGroupableId, [subscriptionFilters]);
        } else {
            // this.debug("Adding filters to delayed subscription", filterGroupableId, filters);
            delayedItem.push(subscriptionFilters);
        }

        subscription.once("close", () => {
            const delayedItem = this.delayedItems.get(filterGroupableId);
            if (!delayedItem) return;

            // remove item from delayedItem that has subscription
            delayedItem.splice(delayedItem.findIndex(i => i.subscription === subscription), 1);

            if (this.delayedItems.get(filterGroupableId)?.length === 0) {
                this.delayedItems.delete(filterGroupableId);
            }
        });

        // this.debug(`${filterGroupableId} has ${this.delayedItems.get(filterGroupableId)?.length} subscriptions`);

        const timeout = setTimeout(() => {
            this.executeGroup(filterGroupableId, subscription);
        }, subscription.opts.groupableDelay);

        if (this.delayedTimers.has(filterGroupableId)) {
            this.delayedTimers.get(filterGroupableId)!.push(timeout);
        } else {
            this.delayedTimers.set(filterGroupableId, [timeout]);
        }
        // this.debug(`there are ${this.delayedTimers.get(filterGroupableId)!.length} delayed items`);
    }

    /**
     * Executes a delayed subscription via its groupable ID.
     * @param groupableId
     */
    private executeGroup(groupableId: NDKFilterGroupingId, triggeredBy: NDKSubscription) {
        const delayedItem = this.delayedItems.get(groupableId);
        this.delayedItems.delete(groupableId);

        const timeouts = this.delayedTimers.get(groupableId);
        // this.groupingDebug("Executing group", groupableId, "triggered by", triggeredBy, `which has ${timeouts?.length} timeouts`);

        // clear all timeouts
        if (timeouts) {
            for (const timeout of timeouts) {
                clearTimeout(timeout);
            }
        }

        if (delayedItem) {
            // Go through each index of one of the delayed item's filters so we can merge each items' index with the filters in the same index. The groupable ID guarantees that the filters will be mergable at the index level
            // and that all filters have the same number of filters.
            const filterCount = delayedItem[0].filters.length;
            const mergedFilters: NDKFilter[] = [];

            for (let i = 0; i < filterCount; i++) {
                const allFiltersAtIndex: NDKFilter[] = delayedItem.map((di) => di.filters[i]);
                mergedFilters.push(mergeFilters(allFiltersAtIndex));
            }

            // this.groupingDebug("Merged filters", groupableId, JSON.stringify(mergedFilters), delayedItem.map((di) => di.filters[0]));

            this.executeSubscriptions(delayedItem, mergedFilters);
        }
    }

    /**
     * Executes one or more subscriptions.
     *
     * When there are more than one subscription, results
     * will be sent to the right subscription
     *
     * @param subscriptions
     * @param filters The filters as they should be sent to the relay
     */
    private executeSubscriptions(
        subscriptionFilters: NDKRelaySubscriptionFilters[],
        mergedFilters: NDKFilter[],
    ): Sub {
        const subscriptions: NDKSubscription[] = [];

        for (const {subscription} of subscriptionFilters) {
            subscriptions.push(subscription);
        }

        const subId = generateSubId(subscriptions, mergedFilters);
        const sub = this.conn.relay.sub(mergedFilters, { id: subId });
        this.debug(`Subscribed to ${JSON.stringify(mergedFilters)}`);

        this.activeSubscriptions.set(sub, subscriptionFilters);

        sub.on("event", (event: NostrEvent) => {
            const e = new NDKEvent(undefined, event);
            e.relay = this.ndkRelay;

            subscriptionFilters.forEach((sf) => sf.eventReceived(e));
        });

        sub.on("eose", () => {
            subscriptionFilters.forEach((sf) => sf.subscription.eoseReceived(this.ndkRelay));
        });

        // When an NDKSubscription unsubscribes, remove it from the active subscriptions
        for (const {subscription} of subscriptionFilters) {
            subscription.once("close", () => {
                const activeFilters = this.activeSubscriptions.get(sub);

                // remove item from activeFilters that has subscription
                activeFilters?.splice(activeFilters.findIndex(i => i.subscription === subscription), 1);

                // if there are no more active filters, remove the subscription
                if (activeFilters?.length === 0) {
                    this.activeSubscriptions.delete(sub);
                    sub.unsub();
                }
            });
        }

        // sub.unsub = () => {
        //     this.debug(`Unsubscribing from ${JSON.stringify(filters)}`);
        //     this.activeSubscriptions.delete(subscription);
        // };

        // this.activeSubscriptions.add(subscription);
        // subscription.on("close", () => {
        //     this.activeSubscriptions.delete(subscription);
        // });

        return sub;
    }
}