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

export interface EmojiPickerConfig {
    /** Default emojis to show at the end */
    defaults?: EmojiData[];
    /** Pubkeys to aggregate emojis from (sorted by frequency) */
    from?: string[];
}

/**
 * Creates a reactive emoji picker state manager
 *
 * Fetches and aggregates emojis from multiple sources:
 * 1. User's preferred emojis (NIP-51 kind:10030) - shown first
 * 2. Aggregated emojis from specified pubkeys (sorted by frequency) - shown second
 * 3. Default emojis - shown last
 *
 * @param config - Closure returning configuration with defaults and from pubkeys
 * @param ndk - Optional NDK instance (uses context if not provided)
 * @returns Object with aggregated emojis from all sources
 *
 * @example
 * ```svelte
 * <script>
 *   const emojiState = createEmojiPicker(() => ({
 *     defaults: [{ emoji: '❤️' }, { emoji: '👍' }],
 *     from: ['hexpubkey1', 'hexpubkey2']
 *   }));
 * </script>
 *
 * {#each emojiState.emojis as emoji}
 *   {#if emoji.url}
 *     <img src={emoji.url} alt={emoji.shortcode} />
 *   {:else}
 *     {emoji.emoji}
 *   {/if}
 * {/each}
 * ```
 */
export function createEmojiPicker(config: () => EmojiPickerConfig, ndk?: NDKSvelte) {
    const resolvedNDK = resolveNDK(ndk);

    // Subscribe to user's preferred emojis (kind 10030)
    let userEmojisSub = $state<ReturnType<NDKSvelte["$subscribe"]> | null>(null);
    let fromEmojisSub = $state<ReturnType<NDKSvelte["$subscribe"]> | null>(null);

    // Subscribe to user's own emojis
    $effect(() => {
        if (!resolvedNDK.$currentPubkey) {
            userEmojisSub = null;
            return;
        }

        userEmojisSub = resolvedNDK.$subscribe(() => ({
            filters: [{
                kinds: [10030 as NDKKind],
                authors: [resolvedNDK.$currentPubkey!]
            }],
        }));
    });

    // Subscribe to emojis from specified pubkeys
    $effect(() => {
        const cfg = config();
        const fromPubkeys = cfg.from;

        if (!fromPubkeys || fromPubkeys.length === 0) {
            fromEmojisSub = null;
            return;
        }

        fromEmojisSub = resolvedNDK.$subscribe(() => ({
            filters: [{
                kinds: [10030 as NDKKind],
                authors: fromPubkeys
            }],
        }));
    });

    const emojis = $derived.by((): EmojiData[] => {
        const cfg = config();
        const result: EmojiData[] = [];
        const seen = new Set<string>();

        // Helper to create unique key for deduplication
        const getEmojiKey = (emoji: EmojiData): string => {
            return emoji.url ? emoji.url : emoji.emoji;
        };

        // 1. Add user's own emojis first
        const userSub = userEmojisSub;
        if (userSub && userSub.events[0]) {
            for (const tag of userSub.events[0].tags) {
                if (tag[0] === 'emoji' && tag[1] && tag[2]) {
                    const emojiData: EmojiData = {
                        emoji: `:${tag[1]}:`,
                        shortcode: tag[1],
                        url: tag[2]
                    };
                    const key = getEmojiKey(emojiData);
                    if (!seen.has(key)) {
                        seen.add(key);
                        result.push(emojiData);
                    }
                }
            }
        }

        // 2. Aggregate emojis from 'from' pubkeys, sorted by frequency
        const fromSub = fromEmojisSub;
        if (fromSub && fromSub.events.length > 0) {
            const emojiCounts = new Map<string, { emoji: EmojiData; count: number }>();

            for (const event of fromSub.events) {
                for (const tag of event.tags) {
                    if (tag[0] === 'emoji' && tag[1] && tag[2]) {
                        const emojiData: EmojiData = {
                            emoji: `:${tag[1]}:`,
                            shortcode: tag[1],
                            url: tag[2]
                        };
                        const key = getEmojiKey(emojiData);

                        if (!seen.has(key)) {
                            const existing = emojiCounts.get(key);
                            if (existing) {
                                existing.count++;
                            } else {
                                emojiCounts.set(key, { emoji: emojiData, count: 1 });
                            }
                        }
                    }
                }
            }

            // Sort by frequency and add to result
            const sortedEmojis = Array.from(emojiCounts.values())
                .sort((a, b) => b.count - a.count)
                .map(item => item.emoji);

            for (const emoji of sortedEmojis) {
                const key = getEmojiKey(emoji);
                if (!seen.has(key)) {
                    seen.add(key);
                    result.push(emoji);
                }
            }
        }

        // 3. Add default emojis last
        if (cfg.defaults) {
            for (const emoji of cfg.defaults) {
                const key = getEmojiKey(emoji);
                if (!seen.has(key)) {
                    seen.add(key);
                    result.push(emoji);
                }
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
