import type { NDKFilter, NDKSubscription } from "../subscription/index.js";

/**
 * Checks if a kind is ephemeral (20000-29999 range).
 * Ephemeral events are not stored in cache, so there's no point querying for them.
 */
export function isEphemeralKind(kind: number): boolean {
    return kind >= 20000 && kind < 30000;
}

/**
 * Filters out ephemeral kinds from a filter's kinds array.
 * Returns null if the filter had kinds but all were ephemeral (meaning the filter should be skipped entirely).
 * Returns the original filter if no kinds were specified (don't break REQs without kind filters).
 * Returns a new filter with non-ephemeral kinds if some kinds were valid.
 */
export function filterEphemeralKindsFromFilter(filter: NDKFilter): NDKFilter | null {
    // If no kinds are specified, return the filter as-is
    // (we don't want to break REQs that don't specify kinds)
    if (!filter.kinds || filter.kinds.length === 0) {
        return filter;
    }

    // Filter out ephemeral kinds
    const nonEphemeralKinds = filter.kinds.filter((kind) => !isEphemeralKind(kind));

    // If all kinds were ephemeral, return null to skip this filter entirely
    if (nonEphemeralKinds.length === 0) {
        return null;
    }

    // If no kinds were filtered out, return the original filter
    if (nonEphemeralKinds.length === filter.kinds.length) {
        return filter;
    }

    // Return a new filter with only non-ephemeral kinds
    return {
        ...filter,
        kinds: nonEphemeralKinds,
    };
}

/**
 * Processes filters for cache queries by:
 * 1. Removing constrained fields (limit, since, until) if cacheUnconstrainFilter is set
 * 2. Filtering out ephemeral kinds (20000-29999) since they're never cached
 *
 * Returns an empty array if all filters should be skipped (all kinds were ephemeral).
 */
export function filterForCache(subscription: NDKSubscription): NDKFilter[] {
    let filters = subscription.filters;

    // First, handle cacheUnconstrainFilter if set
    if (subscription.cacheUnconstrainFilter) {
        filters = filters.map((filter) => {
            const filterCopy = { ...filter };
            for (const key of subscription.cacheUnconstrainFilter!) {
                delete (filterCopy as Record<string, unknown>)[key];
            }
            return filterCopy;
        });
        // Remove filters that became empty after removing constrained keys
        filters = filters.filter((filter) => Object.keys(filter).length > 0);
    }

    // Then, filter out ephemeral kinds
    const processedFilters: NDKFilter[] = [];

    for (const filter of filters) {
        const processed = filterEphemeralKindsFromFilter(filter);
        if (processed !== null) {
            processedFilters.push(processed);
        }
    }

    return processedFilters;
}
