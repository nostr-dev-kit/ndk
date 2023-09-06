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

/**
 * Compares whether a filter includes another filter.
 * @param filter1 Filter to compare from
 * @param filter2 Filter to compare to
 * @example
 * const filter1 = { authors: ["a", "b"] };
 * const filter2 = { authors: ["a", "b", "c"] };
 * compareFilter(filter1, filter2); // true
 *
 * const filter1 = { authors: ["a", "b"] };
 * const filter2 = { authors: ["a", "c"] };
 * compareFilter(filter1, filter2); // false
 * @returns
 */
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

    if (subIds.length > 0) {
        subIdParts.push(Array.from(new Set(subIds)).join(','));
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
