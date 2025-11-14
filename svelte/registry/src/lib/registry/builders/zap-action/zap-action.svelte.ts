import { NDKEvent, NDKKind, NDKZapper, zapInvoiceFromEvent, type NDKUser } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { getNDK } from '../../utils/ndk/index.svelte.js';

export interface ZapStats {
    count: number;
    totalAmount: number;
    hasZapped: boolean;
}

export interface ZapActionConfig {
    target: NDKEvent | NDKUser | undefined;
}

export type ZapFunction = (amount: number, comment?: string) => Promise<void>;
export type ZapIntentCallback = (event: NDKEvent, zapFn: ZapFunction) => void;

/**
 * Creates a reactive zap action state manager
 *
 * @param config - Function returning configuration with target
 * @param ndk - Optional NDK instance, will use context if not provided
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
export function createZapAction(config: () => ZapActionConfig, ndk?: NDKSvelte) {
    const ndk = getNDK(ndk);

    // Subscribe to zaps
    let zapsSub = $state<ReturnType<NDKSvelte['$subscribe']> | null>(null);

    $effect(() => {
        const { target } = config();
        if (!target) {
            zapsSub = null;
            return;
        }

        zapsSub = ndk.$subscribe(() => ({
            filters: [{
                kinds: [NDKKind.Zap],
                ...target.filter(),
            }],
            closeOnEose: false
        }));
    });

    const stats = $derived.by(() => {
        const sub = zapsSub;
        if (!sub) return { count: 0, totalAmount: 0, hasZapped: false };

        const zaps = Array.from(sub.events);
        const zapInvoices = zaps.map(zapInvoiceFromEvent).filter(Boolean);
        const totalAmount = zapInvoices.reduce((sum, invoice) => sum + (invoice?.amount || 0), 0);
        const hasZapped = ndk.$currentPubkey
            ? zapInvoices.some(invoice => invoice?.zapper === ndk.$currentPubkey)
            : false;

        return {
            count: zaps.length,
            totalAmount: Math.floor(totalAmount / 1000), // Convert millisats to sats
            hasZapped
        };
    });

    async function zap(amount: number, comment?: string) {
        const { target } = config();
        if (!target) {
            throw new Error("No target to zap");
        }

        if (!ndk.$currentPubkey) {
            throw new Error("User must be logged in to zap");
        }

        // Use NDKZapper to send the zap
        const zapper = new NDKZapper(target, amount * 1000, "msat", {
            comment,
        });

        await zapper.zap();
    }

    const events = $derived(zapsSub ? Array.from(zapsSub.events) : []);

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
        get events() {
            return events;
        },
        zap
    };
}
