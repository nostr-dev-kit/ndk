import type { NDKFilter } from "../index.js";

export type NDKFilterGroupingId = string;

/**
 * Calculates the groupable ID for this filters.
 * The groupable ID is a deterministic association of the filters
 * used in a filters. When the combination of filters makes it
 * possible to group them, the groupable ID is used to group them.
 *
 * The different filters in the array are differentiated so that
 * filters can only be grouped with other filters that have the same signature
 *
 * @returns The groupable ID, or null if the filters are not groupable.
 */
export function calculateGroupableId(filters: NDKFilter[]): NDKFilterGroupingId | null {
    const elements: string[] = [];

    for (const filter of filters) {
        const hasTimeConstraints = filter.since || filter.until;

        if (hasTimeConstraints) return null;

        const keys = Object.keys(filter || {})
            .sort()
            .join("-");

        elements.push(keys);
    }

    return elements.join("|");
}

/**
 * Go through all the passed filters, which should be
 * relatively similar, and merge them.
 */
export function mergeFilters(filters: NDKFilter[]): NDKFilter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};

    filters.forEach((filter) => {
        Object.entries(filter).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (result[key] === undefined) {
                    result[key] = [...value];
                } else {
                    result[key] = Array.from(new Set([...result[key], ...value]));
                }
            } else {
                result[key] = value;
            }
        });
    });

    return result as NDKFilter;
}
