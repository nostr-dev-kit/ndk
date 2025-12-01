/**
 * $subscribe guardrails for AI assistants
 */

type ErrorFn = (id: string, message: string, hint?: string) => never;

/**
 * Called when $subscribe is being used
 *
 * CRITICAL: This method takes a CALLBACK FUNCTION, not direct config
 */
export function subscribing(config: unknown, error: ErrorFn): void {
  // Check if config is a function (correct usage)
  if (typeof config === "function") {
    return; // All good!
  }

  // If it's not a function, the AI is using the wrong API
  if (typeof config === "object" && config !== null) {
    error(
      "ndksvelte-subscribe-wrong-api",
      "$subscribe() requires a CALLBACK FUNCTION, not direct config.\n\n" +
        "You're trying to use an API that doesn't exist.\n\n" +
        "WRONG:\n" +
        "  const notes = ndk.$subscribe({ kinds: [1] });\n" +
        "  const notes = ndk.$subscribe([{ kinds: [1] }]);\n\n" +
        "CORRECT:\n" +
        "  const notes = ndk.$subscribe(() => ({\n" +
        "    filters: [{ kinds: [1], limit: 50 }]\n" +
        "  }));\n\n" +
        "The callback enables reactive filters and conditional subscriptions.",
      "Always wrap your config in a callback function: () => ({ ... })",
    );
  }
}
