import { NDKEvent, type NDKUser, NDKZapper } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../ndk-svelte.svelte.js";
import { targetToId } from "./types.js";

/**
 * Get zap amount for a target (reactive)
 *
 * @example
 * ```ts
 * const amount = createZapAmount(ndk, event);
 * {amount.value} sats
 * ```
 */
export function createZapAmount(ndk: NDKSvelte, target: NDKUser | NDKEvent) {
    const value = $derived(ndk.$payments.getZapAmount(target));

    return {
        get value() {
            return value;
        },
    };
}

/**
 * Check if user has zapped a target (reactive)
 *
 * @example
 * ```ts
 * const zapped = createIsZapped(ndk, event);
 * {#if zapped.value}
 *   <span>Already zapped</span>
 * {/if}
 * ```
 */
export function createIsZapped(ndk: NDKSvelte, target: NDKUser | NDKEvent) {
    const value = $derived(ndk.$payments.isZapped(target));

    return {
        get value() {
            return value;
        },
    };
}

/**
 * Get all transactions for a target (reactive)
 *
 * @example
 * ```ts
 * const transactions = createTargetTransactions(ndk, event);
 * {#each transactions.value as tx}
 *   <div>{tx.amount} sats</div>
 * {/each}
 * ```
 */
export function createTargetTransactions(ndk: NDKSvelte, target: NDKUser | NDKEvent) {
    const id = targetToId(target);
    const value = $derived(ndk.$payments.byTarget.get(id) ?? []);

    return {
        get value() {
            return value;
        },
    };
}

/**
 * Get pending payments (reactive)
 *
 * @example
 * ```ts
 * const pending = createPendingPayments(ndk);
 * {#each pending.value as payment}
 *   <div>Pending: {payment.amount} sats</div>
 * {/each}
 * ```
 */
export function createPendingPayments(ndk: NDKSvelte) {
    const value = $derived(ndk.$payments.pending);

    return {
        get value() {
            return value;
        },
    };
}

/**
 * Get transaction history (reactive)
 *
 * @example
 * ```ts
 * const history = createTransactions(ndk, { direction: 'out', limit: 10 });
 * {#each history.value as tx}
 *   <div>{tx.amount} sats</div>
 * {/each}
 * ```
 */
export function createTransactions(ndk: NDKSvelte, opts?: { direction?: "in" | "out"; type?: string; limit?: number }) {
    const value = $derived.by(() => {
        let txs = ndk.$payments.history;

        if (opts?.direction) {
            txs = txs.filter((tx) => "direction" in tx && tx.direction === opts.direction);
        }
        if (opts?.type) {
            txs = txs.filter((tx) => "type" in tx && tx.type === opts.type);
        }
        if (opts?.limit) {
            txs = txs.slice(0, opts.limit);
        }

        return txs;
    });

    return {
        get value() {
            return value;
        },
    };
}

/**
 * Zap action (returns Promise)
 *
 * @example
 * ```ts
 * await zap(ndk, event, 1000, { comment: 'Great post!' });
 * ```
 */
export async function zap(
    ndk: NDKSvelte,
    target: NDKEvent | NDKUser,
    amount: number,
    opts?: { comment?: string; delay?: number },
) {
    if (!ndk.wallet) {
        throw new Error("No wallet connected");
    }

    if (!ndk.$currentPubkey) {
        throw new Error("No active session");
    }

    const zapper = new NDKZapper(target, amount, "msat", {
        comment: opts?.comment,
    });

    // Auto-track
    ndk.$payments.addPending(zapper, ndk.$currentPubkey);

    // Execute with optional delay
    if (opts?.delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                zapper.zap().then(resolve).catch(reject);
            }, opts.delay);
        });
    }

    return await zapper.zap();
}
