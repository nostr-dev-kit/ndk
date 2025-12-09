import { getContext, hasContext } from 'svelte';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * Context key for NDK instance
 * Apps should set this in their root layout:
 * ```ts
 * setContext(NDK_CONTEXT_KEY, ndk);
 * ```
 */
export const NDK_CONTEXT_KEY = 'ndk';

/**
 * Retrieves NDK instance from either explicit parameter or Svelte context
 *
 * This allows components and builders to work without explicitly passing NDK everywhere:
 * - If `ndk` parameter provided, use it (for testing, custom instances)
 * - Otherwise, try to get from Svelte context
 * - Throw helpful error if neither available
 *
 * @param providedNDK - Optional explicit NDK instance
 * @returns NDK instance
 * @throws Error if NDK not found in either source
 *
 * @example
 * ```ts
 * // Most common - NDK from context
 * const ndk = getNDK();
 *
 * // Override with explicit NDK
 * const ndk = getNDK(customNDK);
 * ```
 */
export function getNDK(providedNDK?: NDKSvelte): NDKSvelte {
    // Explicit NDK takes precedence
    if (providedNDK) return providedNDK;

    // Try to get from context (only works during component initialization)
    try {
        if (hasContext(NDK_CONTEXT_KEY)) {
            const contextNDK = getContext<NDKSvelte>(NDK_CONTEXT_KEY);
            if (contextNDK) return contextNDK;
        }
    } catch {
        // getContext called outside component initialization - that's ok
        // Fall through to error below
    }

    throw new Error(
        `NDK not found. Either:
1. Provide as parameter: getNDK(ndk)
2. Set in Svelte context: setContext('${NDK_CONTEXT_KEY}', ndk)`
    );
}
