/**
 * NDK fetchEvents guardrails
 */

import type { NDKFilter, NDKSubscriptionCacheUsage, NDKSubscriptionOptions } from "../../subscription/index.js";

type WarnFn = (id: string, message: string, hint?: string) => never | undefined;
type ShouldWarnRatioFn = () => boolean;

/**
 * Check if filter matches the NIP-33 pattern (decoded naddr)
 * This is: kinds: [X], authors: [Y], "#d": [Z] with exactly one item each
 */
function isNip33Pattern(filters: any): boolean {
    const filterArray = Array.isArray(filters) ? filters : [filters];
    if (filterArray.length !== 1) return false;

    const filter = filterArray[0];

    // Check if it's a NIP-33 filter (kind + author + #d) with single values
    return (
        filter.kinds &&
        Array.isArray(filter.kinds) &&
        filter.kinds.length === 1 &&
        filter.authors &&
        Array.isArray(filter.authors) &&
        filter.authors.length === 1 &&
        filter["#d"] &&
        Array.isArray(filter["#d"]) &&
        filter["#d"].length === 1
    );
}


/**
 * Check if filter is fetching replaceable events where fetchEvents is appropriate
 * Replaceable: kind 0, 3, 10000-19999 (non-parameterized) - just need authors
 * Parameterized replaceable (30000-39999) are handled by isNip33Pattern check
 */
function isReplaceableEventFilter(filters: any): boolean {
    const filterArray = Array.isArray(filters) ? filters : [filters];

    // Empty array should not be considered replaceable
    if (filterArray.length === 0) {
        return false;
    }

    // Check all filters to see if they're only requesting NON-PARAMETERIZED replaceable events
    return filterArray.every((filter) => {
        if (!filter.kinds || !Array.isArray(filter.kinds) || filter.kinds.length === 0) {
            return false;
        }

        // Must have authors for replaceable events (you're fetching specific user's events)
        if (!filter.authors || !Array.isArray(filter.authors) || filter.authors.length === 0) {
            return false;
        }

        // Check if ALL kinds in this filter are NON-PARAMETERIZED replaceable
        // Parameterized replaceable (30000-39999) are NOT included here - they're
        // handled by the isNip33Pattern check which requires #d tag
        const allKindsReplaceable = filter.kinds.every((kind: number) => {
            return kind === 0 || kind === 3 || (kind >= 10000 && kind <= 19999);
        });

        return allKindsReplaceable;
    });
}

/**
 * Format filter for display
 */
function formatFilter(filter: any): string {
    const formatted = JSON.stringify(filter, null, 2);
    // Indent each line for better readability in the error message
    return formatted
        .split("\n")
        .map((line, idx) => (idx === 0 ? line : `   ${line}`))
        .join("\n");
}

/**
 * Warn about using fetchEvents (blocking operation)
 */
export function fetchingEvents(
    filters: NDKFilter | NDKFilter[],
    opts: NDKSubscriptionOptions | undefined,
    warn: WarnFn,
    shouldWarnRatio: ShouldWarnRatioFn,
    incrementCount: () => void,
): void {
    // Track this fetchEvents call
    incrementCount();
    // Skip warning if using ONLY_CACHE - not hitting relays at all
    if (opts?.cacheUsage === ("ONLY_CACHE" as NDKSubscriptionCacheUsage)) {
        return;
    }

    const filterArray = Array.isArray(filters) ? filters : [filters];
    const formattedFilters = filterArray.map(formatFilter).join("\n\n   ---\n\n   ");

    // Special case: Check if this looks like a manually decoded naddr
    if (isNip33Pattern(filters)) {
        const filter = filterArray[0];
        warn(
            "fetch-events-usage",
            "For fetching a NIP-33 addressable event, use fetchEvent() with the naddr directly.\n\n" +
                "📦 Your filter:\n   " +
                formattedFilters +
                "\n\n" +
                "  ❌ BAD:  const decoded = nip19.decode(naddr);\n" +
                "           const events = await ndk.fetchEvents({\n" +
                "             kinds: [decoded.data.kind],\n" +
                "             authors: [decoded.data.pubkey],\n" +
                '             "#d": [decoded.data.identifier]\n' +
                "           });\n" +
                "           const event = Array.from(events)[0];\n\n" +
                "  ✅ GOOD: const event = await ndk.fetchEvent(naddr);\n" +
                "  ✅ GOOD: const event = await ndk.fetchEvent('naddr1...');\n\n" +
                "fetchEvent() handles naddr decoding automatically and returns the event directly.",
        );
    } else if (isReplaceableEventFilter(filters)) {
        // Replaceable events - fetchEvents is actually correct here
        // Don't warn, just skip
        return;
    } else {
        // Check if we should warn based on usage ratio
        if (!shouldWarnRatio()) {
            return;
        }

        // Analyze the filter to provide more context
        let filterAnalysis = "";
        const hasLimit = filterArray.some((f) => f.limit !== undefined);
        const totalKinds = new Set(filterArray.flatMap((f) => f.kinds || [])).size;
        const totalAuthors = new Set(filterArray.flatMap((f) => f.authors || [])).size;

        if (hasLimit) {
            const maxLimit = Math.max(...filterArray.map((f) => f.limit || 0));
            filterAnalysis += `\n   • Limit: ${maxLimit} event${maxLimit !== 1 ? "s" : ""}`;
        }
        if (totalKinds > 0) {
            filterAnalysis += `\n   • Kinds: ${totalKinds} type${totalKinds !== 1 ? "s" : ""}`;
        }
        if (totalAuthors > 0) {
            filterAnalysis += `\n   • Authors: ${totalAuthors} author${totalAuthors !== 1 ? "s" : ""}`;
        }

        // General warning for fetchEvents usage
        warn(
            "fetch-events-usage",
            "fetchEvents() is a BLOCKING operation that waits for EOSE.\n" +
                "In most cases, you should use subscribe() instead.\n\n" +
                "📦 Your filter" +
                (filterArray.length > 1 ? "s" : "") +
                ":\n   " +
                formattedFilters +
                (filterAnalysis ? "\n\n📊 Filter analysis:" + filterAnalysis : "") +
                "\n\n" +
                "  ❌ BAD:  const events = await ndk.fetchEvents(filter);\n" +
                "  ✅ GOOD: ndk.subscribe(filter, { onEvent: (e) => ... });\n\n" +
                "Only use fetchEvents() when you MUST block until data arrives.",
            "For one-time queries, use fetchEvent() instead of fetchEvents() when expecting a single result.",
        );
    }
}
