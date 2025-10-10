/**
 * NDK lifecycle guardrails
 */

import type { NDK } from "../ndk/index.js";
import { GuardrailCheckId } from "./types.js";

/**
 * Check for cache adapter after NDK instantiation.
 * Warns if no cache is configured after 2.5s.
 */
export function checkCachePresence(ndk: NDK, shouldCheck: (id: string) => boolean): void {
    if (!shouldCheck(GuardrailCheckId.NDK_NO_CACHE)) return;

    setTimeout(() => {
        if (!ndk.cacheAdapter) {
            const isBrowser = typeof window !== "undefined";
            const suggestion = isBrowser
                ? "Consider using @nostr-dev-kit/ndk-cache-dexie or @nostr-dev-kit/ndk-cache-sqlite-wasm"
                : "Consider using @nostr-dev-kit/ndk-cache-redis or @nostr-dev-kit/ndk-cache-sqlite";

            // For async observational warnings, we just log - not throw
            // (throwing in setTimeout creates unhandled errors)
            const message =
                "\n🤖 AI_GUARDRAILS WARNING: NDK initialized without a cache adapter. Apps perform significantly better with caching.\n\n" +
                `💡 ${suggestion}\n\n` +
                "🔇 To disable this check:\n" +
                `   ndk.aiGuardrails.skip('${GuardrailCheckId.NDK_NO_CACHE}')\n` +
                `   or set: ndk.aiGuardrails = { skip: new Set(['${GuardrailCheckId.NDK_NO_CACHE}']) }`;

            console.warn(message);
        }
    }, 2500);
}
