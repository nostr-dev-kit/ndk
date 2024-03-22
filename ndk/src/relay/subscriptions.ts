import { EventEmitter } from "tseep";
import type { Sub, SubscriptionOptions } from "nostr-tools";
import { matchFilter } from "nostr-tools";

import type { NDKRelay } from ".";
import type { NostrEvent } from "../events";
import { NDKEvent } from "../events";
import type { NDKFilter, NDKSubscription } from "../subscription";
import type { NDKFilterGroupingId } from "../subscription/grouping.js";
import { calculateGroupableId, mergeFilters } from "../subscription/grouping.js";
import { compareFilter, generateSubId } from "../subscription/utils";
import type { NDKRelayConnectivity } from "./connectivity.js";

/**
 * Represents a collection of NDKSubscriptions (through NDKRelqySubscriptionFilters)
 * that are grouped together to be sent to a relay as a single REQ.
 *
 * @emits closed It monitors the contained subscriptions and when all subscriptions are closed it emits "close".
 */
class NDKGroupedSubscriptions extends EventEmitter implements Iterable<NDKSubscriptionFilters> {
    public subscriptions: NDKSubscriptionFilters[];
    public req?: NDKFilter[];
    public debug: debug.Debugger;

    public constructor(subscriptions: NDKSubscriptionFilters[], debug?: debug.Debugger) {
        super();
        this.subscriptions = subscriptions;
        this.debug = debug || this.subscriptions[0].subscription.debug.extend("grouped");

        for (const subscription of subscriptions) {
            this.handleSubscriptionClosure(subscription);
        }
    }

    /**
     * Adds a subscription to this group.
     * @param subscription
     */
    public addSubscription(subscription: NDKSubscriptionFilters) {
        // this.debug(`adding subscription`, subscription);
        this.subscriptions.push(subscription);

        this.handleSubscriptionClosure(subscription);
    }

    public eventReceived(event: NDKEvent) {
        for (const subscription of this.subscriptions) {
            subscription.eventReceived(event);
        }
    }

    public eoseReceived(relay: NDKRelay) {
        // this.debug(`received EOSE from ${relay.url}, will send it to ${this.subscriptions.length} subscriptions`);

        // Loop through a copy since the "close" handler will modify the subscriptions array
        const subscriptionsToInform = Array.from(this.subscriptions);
        subscriptionsToInform.forEach(async (subscription) => {
            // this.debug(`sending EOSE to subscription ${subscription.subscription.internalId}`);
            subscription.subscription.eoseReceived(relay);
        });
    }

    private handleSubscriptionClosure(subscription: NDKSubscriptionFilters) {
        subscription.subscription.on("close", () => {
            // this.debug(`going to remove subscription ${subscription.subscription.internalId} from grouped subscriptions, before removing there are ${this.subscriptions.length} subscriptions`, this.subscriptions);
            const index = this.subscriptions.findIndex(
                (i) => i.subscription === subscription.subscription
            );
            this.subscriptions.splice(index, 1);

            // this.debug(`there are ${this.subscriptions.length} subscriptions left`);

            if (this.subscriptions.length <= 0) {
                // this.debug(`going to emit close`);
                this.emit("close");
            }
        });
    }

    /**
     * Maps each subscription through a transformation function.
     * @param fn - The transformation function.
     * @returns A new array with each subscription transformed by fn.
     */
    public map<T>(
        fn: (sub: NDKSubscriptionFilters, index: number, array: NDKSubscriptionFilters[]) => T
    ): T[] {
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
            },
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

    private eventMatchesLocalFilter(event: NDKEvent): boolean {
        const rawEvent = event.rawEvent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.filters.some((filter) => matchFilter(filter, rawEvent as any));
    }
}

function findMatchingActiveSubscriptions(activeSubscriptions: NDKFilter[], filters: NDKFilter[]) {
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
    filters: NDKFilter[];
    sub: Sub;
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
    readonly activeSubscriptions: Map<Sub, NDKGroupedSubscriptions> = new Map();
    private activeSubscriptionsByGroupId: Map<NDKFilterGroupingId, FiltersSub> = new Map();
    private executionTimeoutsByGroupId: Map<NDKFilterGroupingId, number> = new Map();
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
    public subscribe(subscription: NDKSubscription, filters: NDKFilter[]): void {
        const groupableId = calculateGroupableId(filters);
        const subscriptionFilters = new NDKSubscriptionFilters(
            subscription,
            filters,
            this.ndkRelay
        );

        const isNotGroupable = !groupableId || !subscription.isGroupable();

        // If this subscription is not groupable, execute it immediately
        if (isNotGroupable) {
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
            const matchingSubscription = findMatchingActiveSubscriptions(
                activeSubscriptions.filters,
                filters
            );

            if (matchingSubscription) {
                const activeSubscription = this.activeSubscriptions.get(activeSubscriptions.sub);
                activeSubscription?.addSubscription(
                    new NDKSubscriptionFilters(subscription, filters, this.ndkRelay)
                );

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

        // Check if we have a timeout for this groupable ID
        let timeout: any = this.executionTimeoutsByGroupId.get(groupableId);

        // If we don't, or if this subscription's delay is marked as "at-most", then schedule the timeout too
        // (it will empty the group when it runs so the race is not a problem)
        if (!timeout || subscription.opts.groupableDelayType === "at-most") {
            timeout = setTimeout(() => {
                this.executeGroup(groupableId, subscription);
            }, subscription.opts.groupableDelay);
            this.executionTimeoutsByGroupId.set(groupableId, timeout as unknown as number);
        }

        if (this.delayedTimers.has(groupableId)) {
            this.delayedTimers.get(groupableId)!.push(timeout as unknown as number);
        } else {
            this.delayedTimers.set(groupableId, [timeout as unknown as number]);
        }
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
            // Go through each index of one of the delayed item's filters so we can merge each items' index with the filters in the same index. The groupable ID guarantees that the filters will be mergable at the index level and that all filters have the same number of filters.
            const filterCount = delayedItem.subscriptions[0].filters.length;
            const mergedFilters: NDKFilter[] = [];

            for (let i = 0; i < filterCount; i++) {
                const allFiltersAtIndex: NDKFilter[] = delayedItem.map((di) => di.filters[i]);
                mergedFilters.push(mergeFilters(allFiltersAtIndex));
            }

            // this.groupingDebug("Merged filters", groupableId, JSON.stringify(mergedFilters), delayedItem.map((di) => di.filters[0]));

            this.executeSubscriptions(groupableId, delayedItem, mergedFilters);
        }
    }

    private executeSubscriptionsWhenConnected(
        groupableId: NDKFilterGroupingId | null,
        groupedSubscriptions: NDKGroupedSubscriptions,
        mergedFilters: NDKFilter[]
    ) {
        // If the relay is not ready, add a one-time listener to wait for the 'ready' event
        const readyListener = () => {
            this.debug("new relay coming online for active subscription", {
                relay: this.ndkRelay.url,
                mergeFilters,
            });
            this.executeSubscriptionsConnected(groupableId, groupedSubscriptions, mergedFilters);
        };

        this.ndkRelay.once("ready", readyListener);

        // Add a one-time listener to remove the readyListener when the subscription stops
        // in case it was stopped before the relay ever becamse available
        groupedSubscriptions.once("close", () => {
            this.ndkRelay.removeListener("ready", readyListener);
        });
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
        mergedFilters: NDKFilter[]
    ) {
        if (this.conn.isAvailable()) {
            this.executeSubscriptionsConnected(groupableId, groupedSubscriptions, mergedFilters);
        } else {
            this.executeSubscriptionsWhenConnected(
                groupableId,
                groupedSubscriptions,
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
    public executeSubscriptionsConnected(
        groupableId: NDKFilterGroupingId | null,
        groupedSubscriptions: NDKGroupedSubscriptions,
        mergedFilters: NDKFilter[]
    ): Sub {
        const subscriptions: NDKSubscription[] = [];

        for (const { subscription } of groupedSubscriptions) {
            subscriptions.push(subscription);
        }

        const subId = generateSubId(subscriptions, mergedFilters);
        groupedSubscriptions.req = mergedFilters;

        const subOptions: SubscriptionOptions = { id: subId };
        if (this.ndkRelay.trusted || subscriptions.every((sub) => sub.opts.skipVerification)) {
            subOptions.skipVerification = true;
        }

        const sub = this.conn.relay.sub(mergedFilters, subOptions);

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
            // this.debug(`Received EOSE from ${this.ndkRelay.url} for subscription ${subId} with filter ${JSON.stringify(mergedFilters)}}`, {subFilters});
            subFilters?.eoseReceived(this.ndkRelay);
        });

        groupedSubscriptions.once("close", () => {
            // this.debug(`Closing subscription ${this.ndkRelay.url} for subscription ${subId}`);
            sub.unsub();
            this.activeSubscriptions.delete(sub);
            if (groupableId) {
                this.activeSubscriptionsByGroupId.delete(groupableId);
            }
        });

        this.executeSubscriptionsWhenConnected(groupableId, groupedSubscriptions, mergedFilters);

        return sub;
    }

    public executedFilters(): Map<NDKFilter[], NDKSubscription[]> {
        const ret = new Map<NDKFilter[], NDKSubscription[]>();

        for (const [, groupedSubscriptions] of this.activeSubscriptions) {
            ret.set(
                groupedSubscriptions.req!,
                groupedSubscriptions.map((sub) => sub.subscription)
            );
        }

        return ret;
    }
}
