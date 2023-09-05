import { Sub, matchFilter } from "nostr-tools";
import { NDKRelay } from ".";
import { NDKFilter, NDKSubscription } from "../subscription";
import { NDKFilterGroupingId, calculateGroupableId, mergeFilters } from "../subscription/grouping.js";
import { NDKEvent, NostrEvent } from "../events";
import { generateSubId } from "../subscription/utils";
import { NDKRelayConnectivity } from "./connectivity.js";

/**
 * Represents filters that might have been fragmented
 * from a broader filter requested by a subscription.
 */
export type NDKRelayFilters = NDKFilter[];

/**
 * Maintains an association of which filters belong to which subscription
 * as sent to this particular relay.
 */
class NDKRelaySubscriptionFilters {
    public subscription: NDKSubscription;
    public filters: NDKRelayFilters = [];
    private ndkRelay: NDKRelay;

    public constructor(subscription: NDKSubscription, filters: NDKFilter[], ndkRelay: NDKRelay) {
        this.subscription = subscription;
        this.filters = filters;
        this.ndkRelay = ndkRelay;
    }

    public eventReceived(event: NDKEvent) {
        if (!this.eventMatchesLocalFilter(event)) return;
        this.subscription.eventReceived(event, this.ndkRelay, false);
    }

    private eventMatchesLocalFilter(
        event: NDKEvent,
    ): boolean {
        const rawEvent = event.rawEvent();
        return this.filters.some((filter) => matchFilter(filter, rawEvent as any));
    }
}

export function compareFilter(
    filter1: NDKFilter,
    filter2: NDKFilter,
) {
    // Make sure the filters have the same number of keys
    if (Object.keys(filter1).length !== Object.keys(filter2).length) return false;

    for (const [key, value] of Object.entries(filter1)) {
        const valuesInFilter2 = filter2[key as keyof NDKFilter] as string[];

        if (!valuesInFilter2) return false;

        if (Array.isArray(value) && Array.isArray(valuesInFilter2)) {
            const v: string[] = value as string[];
            // make sure all values in the filter are in the other filter
            for (const valueInFilter2 of valuesInFilter2) {
                const val: string = valueInFilter2 as string;
                if (!v.includes(val)) {
                    return false;
                }
            }
        } else {
            if (valuesInFilter2 !== value) return false;
        }
    }

    return true;
}

function findMatchingActiveSubscriptions(
    activeSubscriptions: NDKRelayFilters,
    filters: NDKRelayFilters,
) {
    if (activeSubscriptions.length !== filters.length) return false;

    for (let i = 0; i < activeSubscriptions.length; i++) {
        if (!compareFilter(activeSubscriptions[i], filters[i])) {
            break;
        }

        return activeSubscriptions[i];
    }

    return undefined;
}

type FiltersSub = {
    filters: NDKRelayFilters,
    sub: Sub
};

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
    private activeSubscriptionsByGroupId: Map<NDKFilterGroupingId, FiltersSub> = new Map();
    private debug: debug.Debugger;
    private groupingDebug: debug.Debugger;
    private conn: NDKRelayConnectivity;

    public constructor(ndkRelay: NDKRelay) {
        this.ndkRelay = ndkRelay;
        this.conn = ndkRelay.connectivity;
        this.debug = ndkRelay.debug.extend("subscriptions");
        this.groupingDebug = ndkRelay.debug.extend("grouping");
    }

    /**
     * Creates or queues a subscription to the relay.
     */
    public subscribe(
        subscription: NDKSubscription,
        filters: NDKRelayFilters,
    ): void {
        const groupableId = calculateGroupableId(filters);

        if (!groupableId || !subscription.isGroupable()) {
            this.groupingDebug("No groupable ID for filters", filters);
            this.executeSubscriptions(
                groupableId,
                [new NDKRelaySubscriptionFilters(subscription, filters, this.ndkRelay)],
                filters
            );
            return;
        }

        // If there is an active subscription that could be used, use it
        const activeSubscriptions = this.activeSubscriptionsByGroupId.get(groupableId);
        if (activeSubscriptions) {
            const matchingSubscription = findMatchingActiveSubscriptions(activeSubscriptions.filters, filters);

            if (matchingSubscription) {
                const activeSubscription = this.activeSubscriptions.get(activeSubscriptions.sub);
                activeSubscription?.push(new NDKRelaySubscriptionFilters(subscription, filters, this.ndkRelay));

                return;
            }
        }

        const delayedItem = this.delayedItems.get(groupableId);
        const subscriptionFilters = new NDKRelaySubscriptionFilters(subscription, filters, this.ndkRelay);

        if (!delayedItem) {
            // this.debug("New delayed subscription with ID", groupableId, filters);
            this.delayedItems.set(groupableId, [subscriptionFilters]);
        } else {
            // this.debug("Adding filters to delayed subscription", groupableId, filters);
            delayedItem.push(subscriptionFilters);
        }

        subscription.once("close", () => {
            const delayedItem = this.delayedItems.get(groupableId);
            if (!delayedItem) return;

            // remove item from delayedItem that has subscription
            delayedItem.splice(delayedItem.findIndex(i => i.subscription === subscription), 1);

            if (this.delayedItems.get(groupableId)?.length === 0) {
                this.delayedItems.delete(groupableId);
            }
        });

        // this.debug(`${groupableId} has ${this.delayedItems.get(groupableId)?.length} subscriptions`);

        const timeout = setTimeout(() => {
            this.executeGroup(groupableId, subscription);
        }, subscription.opts.groupableDelay);

        if (this.delayedTimers.has(groupableId)) {
            this.delayedTimers.get(groupableId)!.push(timeout);
        } else {
            this.delayedTimers.set(groupableId, [timeout]);
        }
        // this.debug(`there are ${this.delayedTimers.get(groupableId)!.length} delayed items`);
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

            this.executeSubscriptions(
                groupableId,
                delayedItem,
                mergedFilters
            );
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
        groupableId: NDKFilterGroupingId | null,
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
        if (groupableId) {
            this.activeSubscriptionsByGroupId.set(groupableId, { filters: mergedFilters, sub });
        }

        sub.on("event", (event: NostrEvent) => {
            const e = new NDKEvent(undefined, event);
            e.relay = this.ndkRelay;

            const subFilters = this.activeSubscriptions.get(sub);
            subFilters?.forEach((sf) => sf.eventReceived(e));
        });

        sub.on("eose", () => {
            const subFilters = this.activeSubscriptions.get(sub);
            subFilters?.forEach((sf) => sf.subscription.eoseReceived(this.ndkRelay));
        });

        // When an NDKSubscription unsubscribes, remove it from the active subscriptions
        for (const {subscription} of subscriptionFilters) {
            this.onSubscriptionClose(subscription, sub);
        }

        sub.unsub = () => {
            this.debug(`Unsubscribing from ${JSON.stringify(mergedFilters)}`);
            this.activeSubscriptions.delete(sub);

            if (groupableId) {
                this.activeSubscriptionsByGroupId.delete(groupableId!);
            }
        };

        return sub;
    }

    private onSubscriptionClose(
        subscription: NDKSubscription,
        sub: Sub
    ) {
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
}