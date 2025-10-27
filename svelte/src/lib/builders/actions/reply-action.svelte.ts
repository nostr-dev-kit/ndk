import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "../../ndk-svelte.svelte.js";

export interface ReplyStats {
    count: number;
    hasReplied: boolean;
}

/**
 * Creates a reactive reply action state manager
 *
 * @param ndk - The NDKSvelte instance
 * @param event - Function returning the event to reply to
 * @returns Object with reply state and reply function
 *
 * @example
 * ```svelte
 * <script>
 *   const replyAction = createReplyAction(ndk, () => event);
 * </script>
 *
 * <button onclick={() => replyAction.reply("Great post!")}>
 *   Reply ({replyAction.count})
 * </button>
 * ```
 */
export function createReplyAction(
    ndk: NDKSvelte,
    event: () => NDKEvent | undefined
) {
    // Subscribe to replies for this event
    const repliesSub = ndk.$subscribe(() => {
        const e = event();
        if (!e?.id) return undefined;

        return {
            filters: [{
                kinds: [NDKKind.Text],
                "#e": [e.id]
            }],
            opts: { closeOnEose: false }
        };
    });

    const stats = $derived.by((): ReplyStats => {
        const replies = repliesSub.events;
        const currentPubkey = ndk.$currentPubkey;

        return {
            count: replies.size,
            hasReplied: currentPubkey
                ? Array.from(replies).some(r => r.pubkey === currentPubkey)
                : false
        };
    });

    async function reply(content: string): Promise<NDKEvent> {
        const e = event();
        if (!e?.id) {
            throw new Error("No event to reply to");
        }

        if (!ndk.$currentUser) {
            throw new Error("User must be logged in to reply");
        }

        const replyEvent = new NDKEvent(ndk, {
            kind: NDKKind.Text,
            content,
            tags: [
                ["e", e.id, e.relay?.url || "", "reply"],
                ["p", e.pubkey]
            ]
        });

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
