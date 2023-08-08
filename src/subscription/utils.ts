import { NDKFilter, NDKSubscription } from "./index.js";

/**
 * Checks if a subscription is fully guaranteed to have been filled.
 *
 * This is useful to determine if a cache hit fully satisfies a subscription.
 *
 * @param subscription
 * @returns
 */
export function queryFullyFilled(subscription: NDKSubscription): boolean {
    if (filterIncludesIds(subscription.filter)) {
        if (resultHasAllRequestedIds(subscription)) {
            return true;
        }
    }

    return false;
}

function filterIncludesIds(filter: NDKFilter): boolean {
    return !!filter["ids"];
}

function resultHasAllRequestedIds(subscription: NDKSubscription): boolean {
    const ids = subscription.filter["ids"];

    return !!ids && ids.length === subscription.eventFirstSeen.size;
}
