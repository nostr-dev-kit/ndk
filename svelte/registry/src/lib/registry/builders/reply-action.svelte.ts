import { NDKEvent, NDKKind, eventIsReply } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";
import { resolveNDK } from './resolve-ndk.svelte.js';

export interface ReplyStats {
    count: number;
    hasReplied: boolean;
}

export interface ReplyActionConfig {
    event: NDKEvent | undefined;
}

/**
 * Creates a reactive reply action state manager
 *
 * @param config - Function returning configuration with event
 * @param ndk - Optional NDK instance (uses context if not provided)
 * @returns Object with reply state and reply function
 *
 * @example
 * ```svelte
 * <script>
 *   const replyAction = createReplyAction(() => ({ event }));
 * </script>
 *
 * <button onclick={() => replyAction.reply("Great post!")}>
 *   Reply ({replyAction.count})
 * </button>
 * ```
 */
export function createReplyAction(
    config: () => ReplyActionConfig,
    ndk?: NDKSvelte
) {
    const resolvedNDK = resolveNDK(ndk);
    // Subscribe to replies for this event
    let repliesSub = $state<ReturnType<NDKSvelte["$subscribe"]> | null>(null);

    $effect(() => {
        const { event } = config();
        if (!event?.id) {
            repliesSub = null;
            return;
        }

        repliesSub = resolvedNDK.$subscribe(() => ({
            filters: [{
                kinds: [NDKKind.Text, NDKKind.GenericReply],
                ...event.filter(),
            }],
            closeOnEose: false
        }));
    });

    const stats = $derived.by((): ReplyStats => {
        const sub = repliesSub;
        if (!sub) return { count: 0, hasReplied: false };

        const { event } = config();
        if (!event?.id) return { count: 0, hasReplied: false };

        // Use NDK's built-in eventIsReply to filter actual replies
        const actualReplies = Array.from(sub.events).filter(replyEvent =>
            eventIsReply(event, replyEvent)
        );

        return {
            count: actualReplies.length,
            hasReplied: resolvedNDK.$currentPubkey
                ? actualReplies.some(r => r.pubkey === resolvedNDK.$currentPubkey)
                : false
        };
    });

    async function reply(content: string): Promise<NDKEvent> {
        const { event } = config();

        if (!event?.id) {
            throw new Error("No event to reply to");
        }

        if (!resolvedNDK.$currentPubkey) {
            throw new Error("User must be logged in to reply");
        }

        const replyEvent = event.reply();
        replyEvent.content = content;

        await replyEvent.publish();
        return replyEvent;
    }

    return {
        get count() {
            return stats.count;
        },
        get hasReplied() {
            return stats.hasReplied;
        },
        reply
    };
}
