import type { NDKUser } from "@nostr-dev-kit/ndk";
import { NDKList, NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

/**
 * Creates a reactive mute action state manager
 *
 * @param ndk - The NDKSvelte instance
 * @param target - Function returning the target to mute (NDKUser or string pubkey)
 * @returns Object with isMuted state and toggle function
 *
 * @example
 * ```svelte
 * <script>
 *   const muteAction = createMuteAction(ndk, () => user);
 * </script>
 *
 * <button onclick={muteAction.toggle}>
 *   {muteAction.isMuted ? 'Unmute' : 'Mute'}
 * </button>
 * ```
 */
export function createMuteAction(
    ndk: NDKSvelte,
    target: () => NDKUser | string | undefined
) {
    const isMuted = $derived.by(() => {
        const t = target();
        if (!t) return false;

        const pubkey = typeof t === 'string' ? t : t.pubkey;

        // Check the mute list (kind 10000)
        const muteList = ndk.$sessionEvent<NDKList>(NDKList, NDKKind.MuteList);
        if (!muteList) return false;

        return muteList.tags.some(tag =>
            tag[0] === 'p' && tag[1] === pubkey
        );
    });

    async function toggle(): Promise<void> {
        const t = target();
        if (!t) return;

        if (!ndk.$currentUser) {
            throw new Error("User must be logged in to mute");
        }

        const pubkey = typeof t === 'string' ? t : t.pubkey;

        let muteList = ndk.$sessionEvent<NDKList>(NDKList, NDKKind.MuteList);

        // Create mute list if it doesn't exist
        if (!muteList) {
            muteList = new NDKList(ndk, { kind: NDKKind.MuteList });
            muteList.pubkey = ndk.$currentUser.pubkey;
        }

        if (isMuted) {
            // Remove from mute list
            muteList.tags = muteList.tags.filter(tag =>
                !(tag[0] === 'p' && tag[1] === pubkey)
            );
        } else {
            // Add to mute list
            muteList.tags.push(['p', pubkey]);
        }

        await muteList.publishReplaceable();
    }

    return {
        get isMuted() {
            return isMuted;
        },
        toggle
    };
}
