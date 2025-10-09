/**
 * NDK fetchEvents guardrails
 */

type WarnFn = (id: string, message: string, hint?: string) => never | undefined;

/**
 * Warn about using fetchEvents (blocking operation)
 */
export function fetchingEvents(_filters: any, warn: WarnFn): void {
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
