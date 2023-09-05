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

/**
 * Generates a subscription ID based on the subscriptions and filter.
 *
 * When some of the subscriptions specify a subId, those are used,
 * joining them with a comma.
 *
 * If none of the subscriptions specify a subId, a subId is generated
 * by joining all the filter keys, and expanding the kinds with the requested kinds.
 */
export function generateSubId(
    subscriptions: NDKSubscription[],
    filters: NDKFilter[]
): string {
    const subIds = subscriptions.map(sub => sub.subId).filter(Boolean);
    const subIdParts: string[] = [];
    const filterNonKindKeys = new Set<string>();
    const filterKinds = new Set<number>();

    if (subIds.length > 0 && subIds.length < 3) {
        subIdParts.push(subIds.join(','));
    } else {
        for (const filter of filters) {
            for (const key of Object.keys(filter)) {
                if (key === "kinds") {
                    filter.kinds?.forEach(k => filterKinds.add(k));
                } else {
                    filterNonKindKeys.add(key);
                }
            }
        }

        if (filterKinds.size > 0) {
            subIdParts.push("kinds:" + Array.from(filterKinds).join(','));
        }

        if (filterNonKindKeys.size > 0) {
            subIdParts.push(Array.from(filterNonKindKeys).join(','));
        }
    }

    if (subIds.length !== 1) {
        // Add the random string to the resulting subId
        subIdParts.push(Math.floor(Math.random() * 999).toString());
    }

    return subIdParts.join("-");
}
