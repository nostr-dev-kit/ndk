import { NDKEvent, NDKZapper, type NDKUser } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { getContext } from 'svelte';

export interface ZapSendActionConfig {
    target: NDKEvent | NDKUser | undefined;
}

/**
 * Creates a zap send action for sending zaps to a target
 *
 * @param config - Function returning configuration with target
 * @param ndk - Optional NDK instance, will use context if not provided
 * @returns Object with zap function and sending state
 *
 * @example
 * ```svelte
 * <script>
 *   const zapSend = createZapSendAction(() => ({ target: event }));
 * </script>
 *
 * <button onclick={() => zapSend.zap(1000, "Great post!")}>
 *   ⚡ Zap 1000 sats
 * </button>
 * ```
 */
export function createZapSendAction(config: () => ZapSendActionConfig, ndk?: NDKSvelte) {
    const resolvedNDK = ndk || getContext<NDKSvelte>('ndk');

    let sending = $state(false);
    let error = $state<Error | null>(null);

    async function zap(amount: number, comment?: string) {
        const { target } = config();
        if (!target) {
            throw new Error("No target to zap");
        }

        if (!resolvedNDK.$currentPubkey) {
            throw new Error("User must be logged in to zap");
        }

        sending = true;
        error = null;

        try {
            const zapper = new NDKZapper(target, amount * 1000, "msat", {
                comment,
            });

            await zapper.zap();
        } catch (e) {
            error = e instanceof Error ? e : new Error(String(e));
            throw error;
        } finally {
            sending = false;
        }
    }

    return {
        get sending() {
            return sending;
        },
        get error() {
            return error;
        },
        zap
    };
}
