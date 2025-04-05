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
export function filterFingerprint(filters: NDKFilter[], closeOnEose: boolean): NDKFilterFingerprint | undefined {
    const elements: string[] = [];

    for (const filter of filters) {
        const keys = Object.entries(filter || {})
            .map(([key, values]) => {
                if (["since", "until"].includes(key)) {
                    // We don't want to mix different time constraints values, so we include the value in the fingerprint
                    return `${key}:${values as string}`;
                }
                return key;
            })
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
export function mergeFilters(filters: NDKFilter[]): NDKFilter[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: NDKFilter[] = [];
    const lastResult: any = {};

    // concatenate filters that have a limit
    filters.filter((f) => !!f.limit).forEach((filterWithLimit) => result.push(filterWithLimit));

    // only merge the filters that don't have a limit
    filters = filters.filter((f) => !f.limit);

    if (filters.length === 0) return result;

    filters.forEach((filter) => {
        Object.entries(filter).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (lastResult[key] === undefined) {
                    lastResult[key] = [...value];
                } else {
                    lastResult[key] = Array.from(new Set([...lastResult[key], ...value]));
                }
            } else {
                lastResult[key] = value;
            }
        });
    });

    return [...result, lastResult as NDKFilter];
}
