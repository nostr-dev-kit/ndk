import { NDKFilter } from "../index.js";

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

    return elements.join("-");
}