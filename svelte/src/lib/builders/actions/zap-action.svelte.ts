import { NDKEvent, NDKKind, type NDKUser, zapInvoiceFromEvent } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

export interface ZapStats {
    count: number;
    totalAmount: number; // in sats
    hasZapped: boolean;
}

export interface ZapActionConfig {
    ndk: NDKSvelte;
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
 *   const zapAction = createZapAction(() => ({ ndk, target: event }));
 * </script>
 *
 * <button onclick={() => zapAction.zap(1000)}>
 *   ⚡ Zap ({zapAction.totalAmount} sats)
 * </button>
 * ```
 */
export function createZapAction(
    config: () => ZapActionConfig
) {
    // Subscribe to zaps
    let zapsSub = $state<ReturnType<NDKSvelte["$subscribe"]> | null>(null);

    $effect(() => {
        const { ndk, target } = config();
        if (!target) {
            zapsSub = null;
            return;
        }

        // For events, filter by event ID
        if (target instanceof NDKEvent && target.id) {
            zapsSub = ndk.$subscribe(() => ({
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
        zapsSub = ndk.$subscribe(() => ({
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

        const { ndk } = config();
        const zaps = Array.from(sub.events);
        const zapInvoices = zaps.map(zapInvoiceFromEvent).filter(Boolean);
        const totalAmount = zapInvoices.reduce((sum, invoice) =>
            sum + (invoice?.amount || 0), 0
        );

        const hasZapped = ndk.$currentPubkey
            ? zapInvoices.some(invoice => invoice?.zapper === ndk.$currentPubkey)
            : false;

        return {
            count: zaps.length,
            totalAmount: Math.floor(totalAmount / 1000), // Convert millisats to sats
            hasZapped
        };
    });

    async function zap(amount: number, comment?: string): Promise<void> {
        const { ndk, target } = config();

        if (!target) {
            throw new Error("No target to zap");
        }

        if (!ndk.$currentPubkey) {
            throw new Error("User must be logged in to zap");
        }

        // Use NDK's zap functionality
        await target.zap(amount * 1000, comment); // Convert sats to millisats
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
