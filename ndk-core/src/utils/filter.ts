import type { NDKFilter, NDKRawEvent } from "../index.js";

/**
 * Matches a filter against an event
 * @param filter - The filter to match against
 * @param event - The event to match
 * @returns True if the event matches the filter, false otherwise
 */
export function matchFilter(filter: NDKFilter, event: NDKRawEvent): boolean {
    if (filter.ids && filter.ids.indexOf(event.id) === -1) {
        return false;
    }
    if (filter.kinds && filter.kinds.indexOf(event.kind) === -1) {
        return false;
    }
    if (filter.authors && filter.authors.indexOf(event.pubkey) === -1) {
        return false;
    }

    for (const f in filter) {
        if (f[0] === "#") {
            const tagName = f.slice(1);
            if (tagName === "t") {
                // only make lower case if the tag is 't', no need to do lowercase for most other things
                const values = filter[`#${tagName}`]?.map((v: string) => v.toLowerCase());
                if (values && !event.tags.find(([t, v]) => t === tagName && values?.indexOf(v.toLowerCase()) !== -1))
                    return false;
            } else {
                const values = filter[`#${tagName}`];
                if (values && !event.tags.find(([t, v]) => t === tagName && values?.indexOf(v) !== -1)) return false;
            }
        }
    }

    if (filter.since && event.created_at < filter.since) return false;
    if (filter.until && event.created_at > filter.until) return false;

    return true;
}
