import type { NDKSvelte } from "./ndk-svelte.svelte.js";

/**
 * Reactive WoT score for a pubkey
 * Returns a number between 0-1 (higher = closer in WoT)
 *
 * @example
 * ```ts
 * const score = useWoTScore(ndk, pubkey);
 * {score.value}
 * ```
 */
export function useWoTScore(ndk: NDKSvelte, pubkey: string | (() => string)) {
    const score = $derived.by(() => {
        const pk = typeof pubkey === "function" ? pubkey() : pubkey;
        return ndk.wot.getScore(pk);
    });

    return {
        get value() {
            return score;
        },
    };
}

/**
 * Reactive WoT distance (depth) for a pubkey
 * Returns number of hops from root user, or null if not in WoT
 *
 * @example
 * ```ts
 * const distance = useWoTDistance(ndk, pubkey);
 * {distance.value}
 * ```
 */
export function useWoTDistance(ndk: NDKSvelte, pubkey: string | (() => string)) {
    const distance = $derived.by(() => {
        const pk = typeof pubkey === "function" ? pubkey() : pubkey;
        return ndk.wot.getDistance(pk);
    });

    return {
        get value() {
            return distance;
        },
    };
}

/**
 * Reactive check if pubkey is in WoT
 *
 * @example
 * ```ts
 * const inWoT = useIsInWoT(ndk, pubkey, { maxDepth: 2 });
 * {#if inWoT.value}
 *   <span>In your WoT</span>
 * {/if}
 * ```
 */
export function useIsInWoT(ndk: NDKSvelte, pubkey: string | (() => string), options?: { maxDepth?: number }) {
    const inWoT = $derived.by(() => {
        const pk = typeof pubkey === "function" ? pubkey() : pubkey;
        return ndk.wot.includes(pk, options);
    });

    return {
        get value() {
            return inWoT;
        },
    };
}
