import type { NDKUser } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { getNDK } from '../../utils/ndk/index.svelte.js';

export interface MuteActionConfig {

    target: NDKUser | string | undefined;
}

/**
 * Creates a reactive mute action state manager
 *
 * @param config - Function returning configuration with ndk and target
 * @returns Object with isMuted state and mute function
 *
 * @example
 * ```svelte
 * <script>
 *   const muteAction = createMuteAction(() => ({ target: user }));
 * </script>
 *
 * <button onclick={muteAction.mute}>
 *   {muteAction.isMuted ? 'Unmute' : 'Mute'}
 * </button>
 * ```
 */
export function createMuteAction(
    config: () => MuteActionConfig,
    ndkParam?: NDKSvelte
) {
    const ndk = getNDK(ndkParam);

    const isMuted = $derived.by(() => {
        const { target } = config();
        if (!target) return false;

        const pubkey = typeof target === 'string' ? target : target.pubkey;
        return ndk.$mutes?.has(pubkey) ?? false;
    });

    async function mute(): Promise<void> {
        const { target } = config();
        if (!target) return;

        if (!ndk.$currentPubkey) {
            throw new Error("User must be logged in to mute");
        }

        const pubkey = typeof target === 'string' ? target : target.pubkey;
        await ndk.$mutes?.toggle(pubkey);
    }

    return {
        get isMuted() {
            return isMuted;
        },
        mute
    };
}
