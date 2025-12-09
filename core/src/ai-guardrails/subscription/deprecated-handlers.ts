/**
 * Subscription guardrails for deprecated patterns
 */

import type { NDKFilter, NDKSubscriptionOptions } from "../../subscription/index.js";

type WarnFn = (id: string, message: string, hint?: string) => never | undefined;

/**
 * Check if using deprecated third parameter for event handlers
 */
export function checkDeprecatedHandlers(
    filters: NDKFilter | NDKFilter[],
    opts: NDKSubscriptionOptions | undefined,
    thirdParam: any,
    warn: WarnFn,
): void {
    // Skip if third parameter is not being used for handlers
    if (!thirdParam || typeof thirdParam !== "object") {
        return;
    }

    // Check if third parameter contains event handlers
    const hasHandlers =
        thirdParam.onEvent ||
        thirdParam.onEvents ||
        thirdParam.onEose ||
        thirdParam.onClose;

    if (!hasHandlers) {
        return;
    }

    // Build list of handlers being passed incorrectly
    const handlers: string[] = [];
    if (thirdParam.onEvent) handlers.push("onEvent");
    if (thirdParam.onEvents) handlers.push("onEvents");
    if (thirdParam.onEose) handlers.push("onEose");
    if (thirdParam.onClose) handlers.push("onClose");

    const filterExample = Array.isArray(filters)
        ? "[ { kinds: [1], authors: [...] } ]"
        : "{ kinds: [1], authors: [...] }";

    warn(
        "subscription-deprecated-handlers",
        `Event handlers (${handlers.join(", ")}) passed via third parameter are DEPRECATED ${opts?.subId ? `[subid = ${opts.subId}]` : ""}.\n` +
        "All handlers should be passed in the options (second parameter)\n\n" +
        "  ❌ DEPRECATED (third parameter):\n" +
        `     ndk.subscribe(\n` +
        `       ${filterExample},\n` +
        `       { closeOnEose: true },  // Options\n` +
        `       {  // ⚠️ Third parameter\n` +
        `         onEvent: (event) => ...,\n` +
        `         onEose: () => ...\n` +
        `       }\n` +
        `     );\n\n` +
        "  ✅ RECOMMENDED (second parameter):\n" +
        `     ndk.subscribe(\n` +
        `       ${filterExample},\n` +
        `       {  // All in options (second parameter)\n` +
        `         closeOnEose: true,\n` +
        `         onEvent: (event) => ...,\n` +
        `         onEvents: (events) => ...,  // For batch processing\n` +
        `         onEose: () => ...\n` +
        `       }\n` +
        `     );\n\n` +
        "Benefits of the new approach:\n" +
        "  • Cleaner, more consistent API\n" +
        "  • onEvents for batch processing cached events (much faster!)\n" +
        "  • All options in one place",
        "Update your code to use the second parameter for all handlers. " +
        "Third parameter support will be removed in v2.15.0."
    );
}