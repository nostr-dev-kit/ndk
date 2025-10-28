import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

export interface EmojiReaction {
    emoji: string;
    count: number;
    hasReacted: boolean;
    pubkeys: string[];
    userReaction?: NDKEvent;
}

export interface ReactionActionConfig {
    ndk: NDKSvelte;
    event: NDKEvent | undefined;
}

export interface CustomEmojiData {
    emoji: string;
    shortcode?: string;
    url?: string;
}

/**
 * Creates a reactive reaction action state manager
 *
 * @param config - Function returning configuration with ndk and event
 * @returns Object with reaction state and react function
 *
 * @example
 * ```svelte
 * <script>
 *   const reaction = createReactionAction(() => ({ ndk, event: sampleEvent }));
 * </script>
 *
 * <!-- React with any emoji -->
 * <button onclick={() => reaction.react("+")}>
 *   ❤️ {reaction.get("+")?.count ?? 0}
 * </button>
 *
 * <!-- Show all emoji reactions sorted by count -->
 * {#each reaction.all as { emoji, count, hasReacted, pubkeys }}
 *   <button onclick={() => reaction.react(emoji)}>
 *     {emoji} {count}
 *     <!-- Filter for followers on client side -->
 *     {#if pubkeys.filter(pk => ndk.$follows.some(f => f === pk)).length > 0}
 *       ({pubkeys.filter(pk => ndk.$follows.some(f => f === pk)).length} followers)
 *     {/if}
 *   </button>
 * {/each}
 * ```
 */
export function createReactionAction(
    config: () => ReactionActionConfig
) {
    // Subscribe to reactions for this event
    let reactionsSub = $state<ReturnType<NDKSvelte["$subscribe"]> | null>(null);

    $effect(() => {
        const { ndk, event } = config();
        if (!event?.id) {
            reactionsSub = null;
            return;
        }

        reactionsSub = ndk.$subscribe(() => ({
            filters: [{
                kinds: [NDKKind.Reaction],
                "#e": [event.id]
            }]
        }));
    });

    // Get all reactions grouped by emoji, sorted by count
    const all = $derived.by((): EmojiReaction[] => {
        const sub = reactionsSub;
        if (!sub) return [];

        const { ndk } = config();
        const reactions = sub.events;
        const byEmoji = new Map<string, { count: number; hasReacted: boolean; pubkeys: string[]; userReaction?: NDKEvent }>();

        for (const reaction of reactions) {
            const emoji = reaction.content;
            const data = byEmoji.get(emoji) || { count: 0, hasReacted: false, pubkeys: [] };
            data.count++;

            // Track all pubkeys who reacted
            if (!data.pubkeys.includes(reaction.pubkey)) {
                data.pubkeys.push(reaction.pubkey);
            }

            if (reaction.pubkey === ndk.$currentPubkey) {
                data.hasReacted = true;
                data.userReaction = reaction;
            }

            byEmoji.set(emoji, data);
        }

        // Convert to sorted array
        return Array.from(byEmoji.entries())
            .map(([emoji, data]) => ({ emoji, ...data }))
            .sort((a, b) => b.count - a.count);
    });

    async function react(emojiOrData: string | CustomEmojiData): Promise<void> {
        const { ndk, event } = config();

        if (!event?.id) {
            throw new Error("No event to react to");
        }

        if (!ndk.$currentPubkey) {
            throw new Error("User must be logged in to react");
        }

        const emoji = typeof emojiOrData === 'string' ? emojiOrData : emojiOrData.emoji;

        // Check if already reacted with this emoji
        const existingReaction = all.find(r => r.emoji === emoji);
        if (existingReaction?.hasReacted && existingReaction.userReaction) {
            await existingReaction.userReaction.delete();
            return;
        }

        // Use NDK's built-in react method
        const reactionEvent = await event.react(emoji, false);

        // Add NIP-30 custom emoji tag if provided
        if (typeof emojiOrData !== 'string' && emojiOrData.shortcode && emojiOrData.url) {
            reactionEvent.tags.push(["emoji", emojiOrData.shortcode, emojiOrData.url]);
        }

        await reactionEvent.publish();
    }

    function get(emoji: string): EmojiReaction | undefined {
        return all.find(r => r.emoji === emoji);
    }

    return {
        get all() {
            return all;
        },
        get,
        react
    };
}
