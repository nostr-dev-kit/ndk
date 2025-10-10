import { NDKEvent, type NDKUser, NDKZapper } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../ndk-svelte.svelte.js";
import { targetToId } from "./types.js";

/**
 * Get zap amount for a target (reactive)
 *
 * @example
 * ```ts
 * const amount = useZapAmount(ndk, event);
 * {amount.value} sats
 * ```
 */
export function useZapAmount(ndk: NDKSvelte, target: NDKUser | NDKEvent) {
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
 * const zapped = useIsZapped(ndk, event);
 * {#if zapped.value}
 *   <span>Already zapped</span>
 * {/if}
 * ```
 */
export function useIsZapped(ndk: NDKSvelte, target: NDKUser | NDKEvent) {
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
 * const transactions = useTargetTransactions(ndk, event);
 * {#each transactions.value as tx}
 *   <div>{tx.amount} sats</div>
 * {/each}
 * ```
 */
export function useTargetTransactions(ndk: NDKSvelte, target: NDKUser | NDKEvent) {
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
 * const pending = usePendingPayments(ndk);
 * {#each pending.value as payment}
 *   <div>Pending: {payment.amount} sats</div>
 * {/each}
 * ```
 */
export function usePendingPayments(ndk: NDKSvelte) {
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
 * const history = useTransactions(ndk, { direction: 'out', limit: 10 });
 * {#each history.value as tx}
 *   <div>{tx.amount} sats</div>
 * {/each}
 * ```
 */
export function useTransactions(ndk: NDKSvelte, opts?: { direction?: "in" | "out"; type?: string; limit?: number }) {
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
    console.log("[zap] Starting zap flow", {
        target: target instanceof NDKEvent ? "event" : "user",
        targetId: target.id || (target as any).pubkey,
        amount,
        unit: "msat",
        comment: opts?.comment,
    });

    if (!ndk.$wallet.wallet) {
        console.error("[zap] No wallet connected");
        throw new Error("No wallet connected");
    }
    const session = ndk.$sessions.current;
    if (!session) {
        console.error("[zap] No active session");
        throw new Error("No active session");
    }

    console.log("[zap] Creating NDKZapper", {
        walletType: ndk.$wallet.wallet?.type,
        sessionPubkey: session.pubkey,
    });

    const zapper = new NDKZapper(target, amount, "msat", {
        comment: opts?.comment,
    });

    // Auto-track
    ndk.$payments.addPending(zapper, session.pubkey);
    console.log("[zap] Added pending payment to tracking");

    // Execute with optional delay
    if (opts?.delay) {
        console.log("[zap] Delaying zap execution by", opts.delay, "ms");
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                zapper.zap().then(resolve).catch(reject);
            }, opts.delay);
        });
    }

    console.log("[zap] Executing zap immediately");
    try {
        const result = await zapper.zap();

        // Check for partial failures
        const failures = Array.from(result.values()).filter((r) => r instanceof Error);
        if (failures.length > 0) {
            console.warn("[zap] Zap completed with some failures", {
                total: result.size,
                failed: failures.length,
                errors: failures.map((e) => (e as Error).message),
            });
        } else {
            console.log("[zap] Zap completed successfully", result);
        }

        return result;
    } catch (error) {
        console.error("[zap] Zap failed completely", error);
        throw error;
    }
}
