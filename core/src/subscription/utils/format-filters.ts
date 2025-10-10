import type { NDKFilter } from "../index.js";

/**
 * Formats filters into a condensed, readable string for debug logs.
 * Only used when debug is enabled, so performance is not a concern.
 * Arrays are limited to first 3 items, showing count for remaining items.
 *
 * @example
 * formatFilters([{ kinds: [1, 3], authors: ["fa984...", "82341...", ...498 more], limit: 10 }])
 * // => "{kinds:[1,3] authors:[fa984bd5,82341f88,a1b2c3d4+497] limit:10}"
 */
const MAX_ITEMS = 3;

function formatArray(items: (string | number)[], formatter?: (item: string | number) => string): string {
    const formatted = formatter ? items.slice(0, MAX_ITEMS).map(formatter) : items.slice(0, MAX_ITEMS);
    const display = formatted.join(",");
    return items.length > MAX_ITEMS ? `${display}+${items.length - MAX_ITEMS}` : display;
}

export function formatFilters(filters: NDKFilter[]): string {
    return filters
        .map((f) => {
            const parts: string[] = [];

            if (f.ids?.length) {
                parts.push(`ids:[${formatArray(f.ids, (id) => String(id).slice(0, 8))}]`);
            }
            if (f.kinds?.length) {
                parts.push(`kinds:[${formatArray(f.kinds)}]`);
            }
            if (f.authors?.length) {
                parts.push(`authors:[${formatArray(f.authors, (a) => String(a).slice(0, 8))}]`);
            }
            if (f.since) {
                parts.push(`since:${f.since}`);
            }
            if (f.until) {
                parts.push(`until:${f.until}`);
            }
            if (f.limit) {
                parts.push(`limit:${f.limit}`);
            }
            if (f.search) {
                parts.push(`search:"${String(f.search).slice(0, 20)}"`);
            }

            // Handle tag filters like #e, #p, etc.
            for (const [key, value] of Object.entries(f)) {
                if (key.startsWith("#") && Array.isArray(value) && value.length > 0) {
                    parts.push(`${key}:[${formatArray(value, (v) => String(v).slice(0, 8))}]`);
                }
            }

            return `{${parts.join(" ")}}`;
        })
        .join(", ");
}
