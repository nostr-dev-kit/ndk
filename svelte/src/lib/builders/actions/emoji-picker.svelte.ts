import { NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";
import { resolveNDK } from "../resolve-ndk.svelte.js";

export interface EmojiData {
    /** The emoji character or :shortcode: */
    emoji: string;
    /** Optional shortcode for custom emojis */
    shortcode?: string;
    /** Optional image URL for custom emojis */
    url?: string;
}

/**
 * Creates a reactive emoji picker state manager
 *
 * Fetches user's preferred custom emojis from NIP-51 kind:10030
 *
 * @param ndk - Optional NDK instance (uses context if not provided)
 * @returns Object with preferred emojis from Nostr
 *
 * @example
 * ```svelte
 * <script>
 *   const emojiPicker = createEmojiPicker();
 * </script>
 *
 * <!-- User's custom emojis from Nostr -->
 * {#each emojiPicker.emojis as emoji}
 *   {#if emoji.url}
 *     <img src={emoji.url} alt={emoji.shortcode} />
 *   {:else}
 *     {emoji.emoji}
 *   {/if}
 * {/each}
 * ```
 */
export function createEmojiPicker(ndk?: NDKSvelte) {
    const resolvedNDK = resolveNDK(ndk);

    // Subscribe to user's preferred emojis (kind 10030)
    let preferredEmojisSub = $state<ReturnType<NDKSvelte["$subscribe"]> | null>(null);

    $effect(() => {
        if (!resolvedNDK.$currentPubkey) {
            preferredEmojisSub = null;
            return;
        }

        preferredEmojisSub = resolvedNDK.$subscribe(() => ({
            filters: [{
                kinds: [10030 as NDKKind],
                authors: [resolvedNDK.$currentPubkey!]
            }],
        }));
    });

    const emojis = $derived.by((): EmojiData[] => {
        const sub = preferredEmojisSub;
        if (!sub) return [];

        const event = sub.events[0];
        if (!event) return [];

        // Parse emoji tags from the event
        const result: EmojiData[] = [];
        for (const tag of event.tags) {
            if (tag[0] === 'emoji' && tag[1] && tag[2]) {
                result.push({
                    emoji: `:${tag[1]}:`,
                    shortcode: tag[1],
                    url: tag[2]
                });
            }
        }

        return result;
    });

    return {
        get emojis() {
            return emojis;
        }
    };
}
