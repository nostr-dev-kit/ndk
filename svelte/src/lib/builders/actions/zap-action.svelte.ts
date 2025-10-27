import { NDKEvent, NDKKind, type NDKUser, zapInvoiceFromEvent } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

export interface ZapStats {
    count: number;
    totalAmount: number; // in sats
    hasZapped: boolean;
}

/**
 * Creates a reactive zap action state manager
 *
 * @param ndk - The NDKSvelte instance
 * @param target - Function returning the target to zap (NDKEvent or NDKUser)
 * @returns Object with zap state and zap function
 *
 * @example
 * ```svelte
 * <script>
 *   const zapAction = createZapAction(ndk, () => event);
 * </script>
 *
 * <button onclick={() => zapAction.zap(1000)}>
 *   ⚡ Zap ({zapAction.totalAmount} sats)
 * </button>
 * ```
 */
export function createZapAction(
    ndk: NDKSvelte,
    target: () => NDKEvent | NDKUser | undefined
) {
    // Subscribe to zaps
    const zapsSub = ndk.$subscribe(() => {
        const t = target();
        if (!t) return undefined;

        // For events, filter by event ID
        if (t instanceof NDKEvent && t.id) {
            return {
                filters: [{
                    kinds: [9735],
                    "#e": [t.id]
                }],
                opts: { closeOnEose: false }
            };
        }

        // For users, filter by pubkey
        const pubkey = t instanceof NDKEvent ? t.pubkey : t.pubkey;
        return {
            filters: [{
                kinds: [9735],
                "#p": [pubkey]
            }],
            opts: { closeOnEose: false }
        };
    });

    const stats = $derived.by((): ZapStats => {
        const zaps = Array.from(zapsSub.events);
        const zapInvoices = zaps.map(zapInvoiceFromEvent).filter(Boolean);
        const totalAmount = zapInvoices.reduce((sum, invoice) =>
            sum + (invoice?.amount || 0), 0
        );

        const currentPubkey = ndk.$currentPubkey;
        const hasZapped = currentPubkey
            ? zapInvoices.some(invoice => invoice?.zapper === currentPubkey)
            : false;

        return {
            count: zaps.length,
            totalAmount: Math.floor(totalAmount / 1000), // Convert millisats to sats
            hasZapped
        };
    });

    async function zap(amount: number, comment?: string): Promise<void> {
        const t = target();
        if (!t) {
            throw new Error("No target to zap");
        }

        if (!ndk.$currentUser) {
            throw new Error("User must be logged in to zap");
        }

        // Use NDK's zap functionality
        await t.zap(amount * 1000, comment); // Convert sats to millisats
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
