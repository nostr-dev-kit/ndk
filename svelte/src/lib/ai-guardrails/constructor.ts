/**
 * NDKSvelte constructor guardrails
 */

import type { NDKSvelteParams } from "../ndk-svelte.svelte.js";

type WarnFn = (id: string, message: string, hint?: string) => never | undefined;

/**
 * Called when NDKSvelte is being constructed
 */
export function constructing(
    params: NDKSvelteParams,
    _error: never,
    warn: WarnFn,
): void {
    if (!params.session) {
        warn(
            "ndksvelte-no-session",
            "NDKSvelte instantiated without 'session' parameter.\n\n" +
            "Session support is disabled. This means:\n" +
            "  • No login/logout functionality\n" +
            "  • No wallet integration ($wallet store unavailable)\n" +
            "  • No automatic session persistence\n" +
            "  • No follows/mutes management\n\n" +
            "Most interactive apps need session support.",
            "Enable sessions: new NDKSvelte({ session: true })\n" +
            "Or with custom options: new NDKSvelte({ session: { follows: true, wallet: true } })"
        );
    }
}
