import { Sub, matchFilter } from "nostr-tools";
import { NDKRelay } from ".";
import { NDKFilter, NDKSubscription } from "../subscription";
import { NDKFilterGroupingId, calculateGroupableId, mergeFilters } from "../subscription/grouping.js";
import { NDKEvent, NostrEvent } from "../events";
import { compareFilter, generateSubId } from "../subscription/utils";
import { NDKRelayConnectivity } from "./connectivity.js";
import EventEmitter from "eventemitter3";

/**
 * Represents a collection of NDKSubscriptions (through NDKRelqySubscriptionFilters)
 * that are grouped together to be sent to a relay as a single REQ.
 *
 * @emits closed It monitors the contained subscriptions and when all subscriptions are closed it emits "closed".
 */
class NDKGroupedSubscriptions extends EventEmitter implements Iterable<NDKSubscriptionFilters> {
    public subscriptions: NDKSubscriptionFilters[];

    public constructor(
        subscriptions: NDKSubscriptionFilters[],
    ) {
        super();
        this.subscriptions = subscriptions;

        for (const subscription of subscriptions) {
            this.handleSubscriptionClosure(subscription);
        }
    }

    /**
     * Adds a subscription to this group.
     * @param subscription
     */
    public addSubscription(subscription: NDKSubscriptionFilters) {
        this.subscriptions.push(subscription);

        this.handleSubscriptionClosure(subscription);
    }

    public eventReceived(event: NDKEvent) {
        for (const subscription of this.subscriptions) {
            subscription.eventReceived(event);
        }
    }

    public eoseReceived(relay: NDKRelay) {
        for (const subscription of this.subscriptions) {
            subscription.subscription.eoseReceived(relay);
        }
    }

    private handleSubscriptionClosure(subscription: NDKSubscriptionFilters) {
        subscription.subscription.once("close", () => {
            const index = this.subscriptions.findIndex(i => i.subscription === subscription.subscription);
            this.subscriptions.splice(index, 1);

            if (this.subscriptions.length <= 0) {
                this.emit("closed");
            }
        });
    }

    /**
     * Maps each subscription through a transformation function.
     * @param fn - The transformation function.
     * @returns A new array with each subscription transformed by fn.
     */
    public map<T>(fn: (sub: NDKSubscriptionFilters, index: number, array: NDKSubscriptionFilters[]) => T): T[] {
        return this.subscriptions.map(fn);
    }

    [Symbol.iterator](): Iterator<NDKSubscriptionFilters> {
        let index = 0;
        const subscriptions = this.subscriptions;

        return {
            next(): IteratorResult<NDKSubscriptionFilters> {
                if (index < subscriptions.length) {
                    return { value: subscriptions[index++], done: false };
                } else {
                    return { value: null, done: true };
                }
            }
        };
    }
}

/**
 * Maintains an association of which filters belong to which subscription
 * as sent to this particular relay.
 */
class NDKSubscriptionFilters {
    public subscription: NDKSubscription;
    public filters: NDKFilter[] = [];
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

function findMatchingActiveSubscriptions(
    activeSubscriptions: NDKFilter[],
    filters: NDKFilter[],
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
    filters: NDKFilter[],
    sub: Sub
};

/**
 * @ignore
 */
export class NDKRelaySubscriptions {
    private ndkRelay: NDKRelay;
    private delayedItems: Map<NDKFilterGroupingId, NDKGroupedSubscriptions> = new Map();
    private delayedTimers: Map<NDKFilterGroupingId, number[]> = new Map();

    /**
     * Active subscriptions this relay is connected to
     */
    private activeSubscriptions: Map<Sub, NDKGroupedSubscriptions> = new Map();
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
        filters: NDKFilter[],
    ): void {
        const groupableId = calculateGroupableId(filters);
        const subscriptionFilters = new NDKSubscriptionFilters(subscription, filters, this.ndkRelay);

        // If this subscription is not groupable, execute it immediately
        if (!groupableId || !subscription.isGroupable()) {
            this.groupingDebug("No groupable ID for filters", filters);
            this.executeSubscriptions(
                groupableId,
                // hacky
                new NDKGroupedSubscriptions([subscriptionFilters]),
                filters
            );
            return;
        }

        /* Check if there is an existing connection we can hook into */
        // TODO: Need a way to allow developers to opt out from this in case they want to receive before EOSE
        // events
        const activeSubscriptions = this.activeSubscriptionsByGroupId.get(groupableId);
        if (activeSubscriptions) {
            const matchingSubscription = findMatchingActiveSubscriptions(activeSubscriptions.filters, filters);

            if (matchingSubscription) {
                const activeSubscription = this.activeSubscriptions.get(activeSubscriptions.sub);
                activeSubscription?.addSubscription(new NDKSubscriptionFilters(subscription, filters, this.ndkRelay));

                return;
            }
        }

        let delayedItem = this.delayedItems.get(groupableId);

        if (!delayedItem) {
            // No similar subscription exists, create a new delayed subscription
            // this.debug("New delayed subscription with ID", groupableId, filters);
            delayedItem = new NDKGroupedSubscriptions([subscriptionFilters]);
            this.delayedItems.set(groupableId, delayedItem);

            // When the subscription closes, remove it from the delayed items
            // XXX Need to remove this listener when the delayed item is executed
            delayedItem.once("close", () => {
                const delayedItem = this.delayedItems.get(groupableId);
                if (!delayedItem) return;
                this.delayedItems.delete(groupableId);
            });
        } else {
            // A similar subscription exists, add this subscription to the delayed subscription
            // this.debug("Adding filters to delayed subscription", groupableId, filters);
            delayedItem.addSubscription(subscriptionFilters);
        }

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
        this.delayedTimers.delete(groupableId);
        // this.groupingDebug(`Executing group ${groupableId} triggered by which has ${timeouts?.length} timeouts, sub delay is ${triggeredBy.opts.groupableDelay}ms ${triggeredBy.opts.subId}`, triggeredBy);

        // clear all timeouts
        if (timeouts) {
            for (const timeout of timeouts) {
                clearTimeout(timeout);
            }
        }

        if (delayedItem) {
            // Go through each index of one of the delayed item's filters so we can merge each items' index with the filters in the same index. The groupable ID guarantees that the filters will be mergable at the index level
            // and that all filters have the same number of filters.
            const filterCount = delayedItem.subscriptions[0].filters.length;
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
     * If the relay is not connected, subscriptions will be queued
     * until the relay connects.
     *
     * @param groupableId
     * @param subscriptionFilters
     * @param mergedFilters
     */
    private executeSubscriptions(
        groupableId: NDKFilterGroupingId | null,
        groupedSubscriptions: NDKGroupedSubscriptions,
        mergedFilters: NDKFilter[],
    ) {
        if (this.conn.isAvailable()) {
            this.executeSubscriptionsConnected(groupableId, groupedSubscriptions, mergedFilters);
        } else {
            // If the relay is not connected, add a one-time listener to wait for the 'connected' event
            const connectedListener = () => {
                this.debug(
                    "new relay coming online for active subscription",
                    {
                        relay: this.ndkRelay.url,
                        mergeFilters
                    }
                );
                this.executeSubscriptionsConnected(groupableId, groupedSubscriptions, mergedFilters);
            };
            this.ndkRelay.once("connect", connectedListener);

            // Add a one-time listener to remove the connectedListener when the subscription stops
            // in case it was stopped before the relay ever becamse available
            groupedSubscriptions.once("close", () => {
                this.ndkRelay.removeListener("connect", connectedListener);
            });
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
    private executeSubscriptionsConnected(
        groupableId: NDKFilterGroupingId | null,
        groupedSubscriptions: NDKGroupedSubscriptions,
        mergedFilters: NDKFilter[],
    ): Sub {
        const subscriptions: NDKSubscription[] = [];

        for (const {subscription} of groupedSubscriptions) {
            subscriptions.push(subscription);
        }

        const subId = generateSubId(subscriptions, mergedFilters);
        const sub = this.conn.relay.sub(mergedFilters, { id: subId });
        this.debug(`Subscribed to ${JSON.stringify(mergedFilters)}`);

        this.activeSubscriptions.set(sub, groupedSubscriptions);
        if (groupableId) {
            this.activeSubscriptionsByGroupId.set(groupableId, { filters: mergedFilters, sub });
        }

        sub.on("event", (event: NostrEvent) => {
            const e = new NDKEvent(undefined, event);
            e.relay = this.ndkRelay;

            const subFilters = this.activeSubscriptions.get(sub);
            subFilters?.eventReceived(e);
        });

        sub.on("eose", () => {
            const subFilters = this.activeSubscriptions.get(sub);
            subFilters?.eoseReceived(this.ndkRelay);
        });

        groupedSubscriptions.once("closed", () => {
            this.activeSubscriptions.delete(sub);
            if (groupableId) {
                this.activeSubscriptionsByGroupId.delete(groupableId);
            }
        });

        return sub;
    }
}