import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

export interface ReplyStats {
    count: number;
    hasReplied: boolean;
}

export interface ReplyActionConfig {
    ndk: NDKSvelte;
    event: NDKEvent | undefined;
}

/**
 * Creates a reactive reply action state manager
 *
 * @param config - Function returning configuration with ndk and event
 * @returns Object with reply state and reply function
 *
 * @example
 * ```svelte
 * <script>
 *   const replyAction = createReplyAction(() => ({ ndk, event }));
 * </script>
 *
 * <button onclick={() => replyAction.reply("Great post!")}>
 *   Reply ({replyAction.count})
 * </button>
 * ```
 */
export function createReplyAction(
    config: () => ReplyActionConfig
) {
    // Subscribe to replies for this event
    let repliesSub = $state<ReturnType<NDKSvelte["$subscribe"]> | null>(null);

    $effect(() => {
        const { ndk, event } = config();
        if (!event?.id) {
            repliesSub = null;
            return;
        }

        repliesSub = ndk.$subscribe(() => ({
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

        const { ndk } = config();
        const replies = sub.events;

        return {
            count: replies.length,
            hasReplied: ndk.$currentPubkey
                ? Array.from(replies).some(r => r.pubkey === ndk.$currentPubkey)
                : false
        };
    });

    async function reply(content: string): Promise<NDKEvent> {
        const { ndk, event } = config();

        if (!event?.id) {
            throw new Error("No event to reply to");
        }

        if (!ndk.$currentPubkey) {
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
