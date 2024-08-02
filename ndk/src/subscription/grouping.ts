import type { NDKFilter } from "../index.js";

export type NDKFilterFingerprint = string;

/**
 * Creates a fingerprint for this filter
 *
 * This a deterministic association of the filters
 * used in a filters. When the combination of filters makes it
 * possible to group them, the fingerprint is used to group them.
 *
 * The different filters in the array are differentiated so that
 * filters can only be grouped with other filters that have the same signature
 *
 * The calculated group ID uses a + prefix to avoid grouping subscriptions
 * that intend to close immediately after EOSE and those that are probably
 * going to be kept open.
 *
 * @returns The fingerprint, or undefined if the filters are not groupable.
 */
export function filterFingerprint(
    filters: NDKFilter[],
    closeOnEose: boolean
): NDKFilterFingerprint | undefined {
    const elements: string[] = [];

    for (const filter of filters) {
        const hasTimeConstraints = filter.since || filter.until;

        if (hasTimeConstraints) return undefined;

        const keys = Object.keys(filter || {})
            .sort()
            .join("-");

        elements.push(keys);
    }

    let id = closeOnEose ? "+" : "";
    id += elements.join("|");
    return id;
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
