import { NDKEvent, NDKKind, type Hexpubkey } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../ndk-svelte.svelte.js";

export interface ReactionStats {
    count: number;
    hasReacted: boolean;
    userReaction?: NDKEvent;
}

/**
 * Creates a reactive reaction button state manager
 *
 * @param ndk - The NDKSvelte instance
 * @param event - Function returning the event to react to
 * @param content - Function returning the reaction content (emoji)
 * @returns Object with reaction state and toggle function
 *
 * @example
 * ```svelte
 * <script>
 *   const reaction = createReactionButton(ndk, () => event, () => "+");
 * </script>
 *
 * <button onclick={reaction.toggle}>
 *   {reaction.hasReacted ? 'Unlike' : 'Like'} ({reaction.count})
 * </button>
 * ```
 */
export function createReactionButton(
    ndk: NDKSvelte,
    event: () => NDKEvent | undefined,
    content: () => string = () => "+"
) {
    // Subscribe to reactions for this event
    const reactionsSub = ndk.$subscribe(() => {
        const e = event();
        if (!e?.id) return undefined;

        return {
            filters: [{
                kinds: [NDKKind.Reaction],
                "#e": [e.id]
            }]
        };
    });

    const stats = $derived.by((): ReactionStats => {
        const reactions = reactionsSub.events;
        const reactionContent = content();
        const currentPubkey = ndk.$currentPubkey;

        let count = 0;
        let hasReacted = false;
        let userReaction: NDKEvent | undefined;

        for (const reaction of reactions) {
            if (reaction.content === reactionContent) {
                count++;
                if (reaction.pubkey === currentPubkey) {
                    hasReacted = true;
                    userReaction = reaction;
                }
            }
        }

        return { count, hasReacted, userReaction };
    });

    // Get all reactions by emoji
    const allReactions = $derived.by(() => {
        const reactions = reactionsSub.events;
        const byEmoji = new Map<string, ReactionStats>();

        for (const reaction of reactions) {
            const emoji = reaction.content;
            const existing = byEmoji.get(emoji) || { count: 0, hasReacted: false };
            existing.count++;

            if (reaction.pubkey === ndk.$currentPubkey) {
                existing.hasReacted = true;
                existing.userReaction = reaction;
            }

            byEmoji.set(emoji, existing);
        }

        return byEmoji;
    });

    async function toggle(): Promise<void> {
        const e = event();
        if (!e?.id) {
            throw new Error("No event to react to");
        }

        if (!ndk.$currentUser) {
            throw new Error("User must be logged in to react");
        }

        const reactionContent = content();

        // If already reacted, delete the reaction
        if (stats.hasReacted && stats.userReaction) {
            await stats.userReaction.delete();
            return;
        }

        // Otherwise, create a new reaction
        const reactionEvent = new NDKEvent(ndk, {
            kind: NDKKind.Reaction,
            content: reactionContent,
            tags: [
                ["e", e.id],
                ["p", e.pubkey]
            ]
        });

        // Add relay hint if available
        if (e.relay) {
            reactionEvent.tags.push(["e", e.id, e.relay.url]);
        }

        await reactionEvent.publish();
    }

    async function react(reactionContent: string): Promise<void> {
        const e = event();
        if (!e?.id) {
            throw new Error("No event to react to");
        }

        if (!ndk.$currentUser) {
            throw new Error("User must be logged in to react");
        }

        // Check if already reacted with this content
        const existingReaction = allReactions.get(reactionContent);
        if (existingReaction?.hasReacted && existingReaction.userReaction) {
            await existingReaction.userReaction.delete();
            return;
        }

        // Create new reaction
        const reactionEvent = new NDKEvent(ndk, {
            kind: NDKKind.Reaction,
            content: reactionContent,
            tags: [
                ["e", e.id],
                ["p", e.pubkey]
            ]
        });

        // Add relay hint if available
        if (e.relay) {
            reactionEvent.tags.push(["e", e.id, e.relay.url]);
        }

        await reactionEvent.publish();
    }

    return {
        get hasReacted() {
            return stats.hasReacted;
        },
        get count() {
            return stats.count;
        },
        get allReactions() {
            return allReactions;
        },
        toggle,
        react
    };
}
