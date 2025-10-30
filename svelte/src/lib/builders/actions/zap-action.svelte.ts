import { NDKEvent, NDKKind, NDKZapper, type NDKUser, zapInvoiceFromEvent } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";
import { resolveNDK } from "../resolve-ndk.svelte.js";

export interface ZapStats {
    count: number;
    totalAmount: number; // in sats
    hasZapped: boolean;
}

export interface ZapActionConfig {

    target: NDKEvent | NDKUser | undefined;
}

/**
 * Creates a reactive zap action state manager
 *
 * @param config - Function returning configuration with ndk and target
 * @returns Object with zap state and zap function
 *
 * @example
 * ```svelte
 * <script>
 *   const zapAction = createZapAction(() => ({ target: event }));
 * </script>
 *
 * <button onclick={() => zapAction.zap(1000)}>
 *   ⚡ Zap ({zapAction.totalAmount} sats)
 * </button>
 * ```
 */
export function createZapAction(
    config: () => ZapActionConfig,
    ndk?: NDKSvelte
) {
    const resolvedNDK = resolveNDK(ndk);

    // Subscribe to zaps
    let zapsSub = $state<ReturnType<NDKSvelte["$subscribe"]> | null>(null);

    $effect(() => {
        const { target } = config();
        if (!target) {
            zapsSub = null;
            return;
        }

        // For events, filter by event ID
        if (target instanceof NDKEvent && target.id) {
            zapsSub = resolvedNDK.$subscribe(() => ({
                filters: [{
                    kinds: [9735],
                    "#e": [target.id]
                }],
                closeOnEose: false
            }));
            return;
        }

        // For users, filter by pubkey
        const pubkey = target instanceof NDKEvent ? target.pubkey : target.pubkey;
        zapsSub = resolvedNDK.$subscribe(() => ({
            filters: [{
                kinds: [9735],
                "#p": [pubkey]
            }],
            closeOnEose: false
        }));
    });

    const stats = $derived.by((): ZapStats => {
        const sub = zapsSub;
        if (!sub) return { count: 0, totalAmount: 0, hasZapped: false };

        const zaps = Array.from(sub.events);
        const zapInvoices = zaps.map(zapInvoiceFromEvent).filter(Boolean);
        const totalAmount = zapInvoices.reduce((sum, invoice) =>
            sum + (invoice?.amount || 0), 0
        );

        const hasZapped = resolvedNDK.$currentPubkey
            ? zapInvoices.some(invoice => invoice?.zapper === resolvedNDK.$currentPubkey)
            : false;

        return {
            count: zaps.length,
            totalAmount: Math.floor(totalAmount / 1000), // Convert millisats to sats
            hasZapped
        };
    });

    async function zap(amount: number, comment?: string): Promise<void> {
        const { target } = config();

        if (!target) {
            throw new Error("No target to zap");
        }

        if (!resolvedNDK.$currentPubkey) {
            throw new Error("User must be logged in to zap");
        }

        // Use NDKZapper to send the zap
        const zapper = new NDKZapper(target, amount * 1000, "msat", {
            comment,
        });
        await zapper.zap();
    }

    return {
        get count() {
            return stats.count;
        },
        get totalAmount() {
            return stats.totalAmount;
        },
        get hasZapped() {
            return stats.hasZapped;
        },
        zap
    };
}
