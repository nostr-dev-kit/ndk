import { NDKZapper, type NDKEvent, type NDKUser } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";

export interface ZapSendSplit {
    pubkey: string;
    amount: number;
    percentage: number;
    user: NDKUser;
}

export interface ZapSendActionConfig {
    target: NDKEvent | NDKUser;
}

/**
 * Creates a reactive action for sending zaps with automatic split calculations
 *
 * This builder provides bindable state for amount and comment, and automatically
 * calculates zap splits with percentages based on NIP-57 zap tags.
 *
 * @param config - Function returning configuration with target to zap
 * @param ndk - NDK Svelte instance
 * @returns Object with bindable state, computed splits, and send function
 *
 * @example
 * ```svelte
 * <script>
 *   const zap = createZapSendAction(() => ({ target: event }), ndk);
 * </script>
 *
 * <input type="number" bind:value={zap.amount} />
 *
 * {#each zap.splits as split}
 *   <div>{split.user.pubkey} will receive {split.amount} sats ({split.percentage}%)</div>
 * {/each}
 *
 * <textarea bind:value={zap.comment} />
 *
 * <button onclick={() => zap.send()} disabled={zap.sending}>
 *   {zap.sending ? 'Zapping...' : `Zap ${zap.amount} sats`}
 * </button>
 * ```
 */
export function createZapSendAction(
    config: () => ZapSendActionConfig,
    ndk: NDKSvelte,
) {
    let amount = $state(1000);
    let comment = $state("");
    let sending = $state(false);
    let error = $state<Error | null>(null);

    const derivedConfig = $derived(config());
    const derivedTarget = $derived(derivedConfig.target);

    // Cache split weights (only recalculates when target changes)
    let splitWeights = $state<Array<{ pubkey: string; weight: number }>>([]);

    $effect(() => {
        if (!derivedTarget) {
            splitWeights = [];
            return;
        }

        const zapper = new NDKZapper(derivedTarget, 1, "msat");
        const rawSplits = zapper.getZapSplits();

        // Extract weights from NIP-57 zap tags
        const zapTags =
            derivedTarget instanceof Object && "getMatchingTags" in derivedTarget
                ? derivedTarget.getMatchingTags("zap")
                : [];

        const weights =
            zapTags.length === 0 ? rawSplits.map(() => 1) : zapTags.map((tag) => Number.parseInt(tag[2]));

        splitWeights = rawSplits.map((split, i) => ({
            pubkey: split.pubkey,
            weight: weights[i] || 1,
        }));
    });

    // Compute actual splits from cached weights + current amount
    const splits = $derived.by((): ZapSendSplit[] => {
        if (splitWeights.length === 0) return [];

        const totalWeight = splitWeights.reduce((sum, s) => sum + s.weight, 0);

        return splitWeights.map((split) => ({
            pubkey: split.pubkey,
            amount: Math.floor((split.weight / totalWeight) * amount),
            percentage: (split.weight / totalWeight) * 100,
            user: ndk.getUser({ pubkey: split.pubkey }),
        }));
    });

    async function send() {
        if (!derivedTarget) throw new Error("No target to zap");

        sending = true;
        error = null;
        try {
            const zapper = new NDKZapper(derivedTarget, amount * 1000, "msat", {
                comment: comment || undefined,
            });
            await zapper.zap();
        } catch (e) {
            error = e as Error;
            throw e;
        } finally {
            sending = false;
        }
    }

    return {
        get amount() {
            return amount;
        },
        set amount(v: number) {
            amount = v;
        },
        get comment() {
            return comment;
        },
        set comment(v: string) {
            comment = v;
        },
        get splits() {
            return splits;
        },
        get sending() {
            return sending;
        },
        get error() {
            return error;
        },
        send,
    };
}
