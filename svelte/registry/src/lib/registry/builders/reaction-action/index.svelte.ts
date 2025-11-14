import { type NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { getNDK } from '../../utils/ndk/index.svelte.js';
import { SvelteMap } from "svelte/reactivity";

export interface EmojiReaction {
    emoji: string;
    count: number;
    hasReacted: boolean;
    pubkeys: string[];
    userReaction?: NDKEvent;
    url?: string;
    shortcode?: string;
}

export interface ReactionActionConfig {
    event: NDKEvent | undefined;
    delayed?: number;
}

export interface CustomEmojiData {
    emoji: string;
    shortcode?: string;
    url?: string;
}

/**
 * Creates a reactive reaction action state manager
 *
 * @param config - Function returning configuration with event and optional delayed seconds
 * @param ndk - Optional NDK instance (uses context if not provided)
 * @returns Object with reaction state and react function
 *
 * @example
 * ```svelte
 * <script>
 *   // NDK from context
 *   const reaction = createReactionAction(() => ({ event: sampleEvent }));
 *
 *   // With explicit NDK
 *   const reaction = createReactionAction(() => ({ event: sampleEvent }), ndk);
 *
 *   // With cancellable delayed publishing (5 seconds)
 *   const reaction = createReactionAction(() => ({ event: sampleEvent, delayed: 5 }), ndk);
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
 *   </button>
 * {/each}
 * ```
 *
 * When `delayed` is set, reactions show immediately (optimistic update) but don't publish
 * for X seconds. Clicking again cancels the pending reaction.
 */
export function createReactionAction(
    config: () => ReactionActionConfig,
    ndkParam?: NDKSvelte
) {
    const ndk = getNDK(ndkParam);
    // Subscribe to reactions for this event
    let reactionsSub = $state<ReturnType<NDKSvelte["$subscribe"]> | null>(null);

    // Track pending (delayed) reactions
    const pendingReactions = new SvelteMap<string, { timer: ReturnType<typeof setTimeout>; event: NDKEvent }>();

    $effect(() => {
        const { event } = config();
        if (!event?.id) {
            reactionsSub = null;
            return;
        }

        reactionsSub = ndk.$subscribe(() => ({
            filters: [{
                kinds: [NDKKind.Reaction],
                ...event.filter()
            }],
            subId: 'reactions'
        }));
    });

    // Get all reactions grouped by emoji, sorted by count
    const all = $derived.by((): EmojiReaction[] => {
        const sub = reactionsSub;
        const reactions = sub?.events || [];
        const byEmoji = new SvelteMap<string, { count: number; hasReacted: boolean; pubkeys: string[]; userReaction?: NDKEvent; url?: string; shortcode?: string }>();

        for (const reaction of reactions) {
            const emoji = reaction.content;
            const data = byEmoji.get(emoji) || { count: 0, hasReacted: false, pubkeys: [] };
            data.count++;

            // Extract NIP-30 custom emoji data if present
            const emojiTag = reaction.tags.find(t => t[0] === 'emoji');
            if (emojiTag && emojiTag[1] && emojiTag[2]) {
                data.shortcode = emojiTag[1];
                data.url = emojiTag[2];
            }

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

        // Include pending reactions in the state (optimistic update)
        for (const [emoji, { event: pendingEvent }] of pendingReactions.entries()) {
            const data = byEmoji.get(emoji) || { count: 0, hasReacted: false, pubkeys: [] };

            // Extract emoji tag from pending event if present
            const emojiTag = pendingEvent.tags.find(t => t[0] === 'emoji');
            if (emojiTag && emojiTag[1] && emojiTag[2]) {
                data.shortcode = emojiTag[1];
                data.url = emojiTag[2];
            }

            // Only add if not already reacted with a published reaction
            if (!data.hasReacted) {
                data.count++;
                data.hasReacted = true;
                if (!data.pubkeys.includes(ndk.$currentPubkey!)) {
                    data.pubkeys.push(ndk.$currentPubkey!);
                }
                data.userReaction = pendingEvent;
            }

            byEmoji.set(emoji, data);
        }

        // Convert to sorted array
        return Array.from(byEmoji.entries())
            .map(([emoji, data]) => ({ emoji, ...data }))
            .sort((a, b) => b.count - a.count);
    });

    async function react(emojiOrData: string | CustomEmojiData): Promise<void> {
        const { event, delayed } = config();

        if (!event?.id) {
            throw new Error("No event to react to");
        }

        if (!ndk.$currentPubkey) {
            throw new Error("User must be logged in to react");
        }

        const emoji = typeof emojiOrData === 'string' ? emojiOrData : emojiOrData.emoji;

        // Check if there's a pending reaction - cancel it
        const pending = pendingReactions.get(emoji);
        if (pending) {
            clearTimeout(pending.timer);
            pendingReactions.delete(emoji);
            return;
        }

        // Check if already reacted with a published reaction
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

        if (delayed && delayed > 0) {
            // Add to pending reactions for optimistic update
            const timer = setTimeout(async () => {
                await reactionEvent.publish();
                pendingReactions.delete(emoji);
            }, delayed * 1000);

            pendingReactions.set(emoji, { timer, event: reactionEvent });
        } else {
            // Publish immediately if no delay
            await reactionEvent.publish();
        }
    }

    function get(emoji: string): EmojiReaction | undefined {
        return all.find(r => r.emoji === emoji);
    }

    const totalCount = $derived(all.reduce((sum, r) => sum + r.count, 0));

    return {
        get all() {
            return all;
        },
        get totalCount() {
            return totalCount;
        },
        get,
        react
    };
}
