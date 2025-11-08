import { getContext, hasContext } from 'svelte';
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

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

const NDK_CONTEXT_KEY = 'ndk';

function resolveNDK(providedNDK?: NDKSvelte): NDKSvelte {
    if (providedNDK) return providedNDK;

    try {
        if (hasContext(NDK_CONTEXT_KEY)) {
            const contextNDK = getContext<NDKSvelte>(NDK_CONTEXT_KEY);
            if (contextNDK) return contextNDK;
        }
    } catch {
        // getContext called outside component initialization
    }

    throw new Error(
        `NDK not found. Either:
1. Provide as second parameter: createEmojiPicker(() => config, ndk)
2. Set in Svelte context: setContext('${NDK_CONTEXT_KEY}', ndk)`
    );
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

    const emojiEvents = resolvedNDK.$subscribe(() => {
        const cfg = config();
        if (!cfg.from && !resolvedNDK.$currentPubkey) return;

        const authors = cfg.from ?? [ndk?.$currentPubkey];

        return {
            filters: [{ kinds: [NDKKind.EmojiList] }],
            subId: 'emojis'
        };
    });

    const emojis = $derived.by((): EmojiData[] => {
        const cfg = config();
        const result: EmojiData[] = [];
        const seen = new Set<string>();

        // Helper to create unique key for deduplication
        const getEmojiKey = (emoji: EmojiData): string => {
            return emoji.url ? emoji.url : emoji.emoji;
        };

        let userEvent: NDKEvent | undefined;
        const otherEvents: NDKEvent[] = [];

        for (const e of emojiEvents.events) {
            if (e.pubkey === resolvedNDK.$currentPubkey) {
                userEvent = e;
            } else {
                otherEvents.push(e);
            }
        }

        // 1. Add user's own emojis first
        if (userEvent) {
            for (const tag of userEvent.tags) {
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

        // 2. Aggregate other emojis, sorted by count
        const emojiCounts = new Map<string, { emoji: EmojiData; count: number }>();

        for (const event of otherEvents) {
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

        // Sort by frequency and add
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

        // 3. Add defaults
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
