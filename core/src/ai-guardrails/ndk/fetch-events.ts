/**
 * NDK fetchEvents guardrails
 */

type WarnFn = (id: string, message: string, hint?: string) => never | undefined;

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
 * Check if filters represent a single event lookup by ID
 */
function isSingleIdLookup(filters: any): boolean {
    // Handle both single filter and array of filters
    const filterArray = Array.isArray(filters) ? filters : [filters];

    // Only consider it a single event lookup if there's exactly one filter
    if (filterArray.length !== 1) return false;

    const filter = filterArray[0];

    // Check if it's an ids filter with a single ID
    return filter.ids && Array.isArray(filter.ids) && filter.ids.length === 1;
}

/**
 * Warn about using fetchEvents (blocking operation)
 */
export function fetchingEvents(filters: any, warn: WarnFn): void {
    // Special case: Check if this looks like a manually decoded naddr
    if (isNip33Pattern(filters)) {
        warn(
            "fetch-events-usage",
            "For fetching a NIP-33 addressable event, use fetchEvent() with the naddr directly:\n\n" +
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
    } else if (isSingleIdLookup(filters)) {
        // If this looks like a single ID lookup, suggest fetchEvent() instead
        warn(
            "fetch-events-usage",
            "For fetching a single event, use fetchEvent() instead:\n\n" +
                "  ❌ BAD:  const events = await ndk.fetchEvents({ ids: [eventId] });\n" +
                "  ✅ GOOD: const event = await ndk.fetchEvent(eventId);\n" +
                "  ✅ GOOD: const event = await ndk.fetchEvent('note1...');\n" +
                "  ✅ GOOD: const event = await ndk.fetchEvent('nevent1...');\n\n" +
                "fetchEvent() is optimized for single event lookups and returns the event directly.",
        );
    } else {
        // General warning for fetchEvents usage
        warn(
            "fetch-events-usage",
            "fetchEvents() is a BLOCKING operation that waits for EOSE.\n" +
                "In most cases, you should use subscribe() instead:\n\n" +
                "  ❌ BAD:  const events = await ndk.fetchEvents(filter);\n" +
                "  ✅ GOOD: ndk.subscribe(filter, { onEvent: (e) => ... });\n\n" +
                "Only use fetchEvents() when you MUST block until data arrives.",
            "For one-time queries, use fetchEvent() instead of fetchEvents() when expecting a single result.",
        );
    }
}
