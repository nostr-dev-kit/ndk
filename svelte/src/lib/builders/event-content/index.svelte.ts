import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';
import { resolveNDK } from '../resolve-ndk.svelte.js';
import {
    buildEmojiMap,
    parseContentToSegments,
    groupConsecutiveImages,
    groupConsecutiveLinks,
    type ParsedSegment,
} from './utils.js';

export interface EventContentState {
    segments: ParsedSegment[];
    content: string;
    emojiMap: Map<string, string>;
}

export interface EventContentConfig {
    event?: NDKEvent | undefined;
    content?: string | undefined;
    emojiTags?: string[][] | undefined;
}

/**
 * Create reactive state for rendering event content with rich parsing
 *
 * Automatically detects and parses:
 * - User mentions (npub, nprofile)
 * - Event references (note, nevent, naddr)
 * - Media (images, videos, YouTube embeds)
 * - Custom emojis
 * - Hashtags
 * - Links
 *
 * @example
 * ```ts
 * // NDK from context
 * const content = createEventContent(() => ({ event: myEvent }));
 *
 * // Or with explicit NDK
 * const content = createEventContent(() => ({ event: myEvent }), ndk);
 *
 * // Access parsed segments
 * content.segments // Array of parsed segments
 * content.content // Cleaned content string
 * content.emojiMap // Map of emoji shortcodes to URLs
 * ```
 */
export function createEventContent(
    config: () => EventContentConfig,
    ndk?: NDKSvelte
): EventContentState {
    return {
        get segments() {
            const actualContent = String(config().event?.content ?? config().content ?? '');
            const event = config().event;
            const actualEmojiTags = (event?.tags && Array.isArray(event.tags))
                ? event.tags.filter(t => t[0] === 'emoji')
                : (config().emojiTags ?? []);

            const cleanedContent = actualContent.replace(/\[Image #\d+\]/gi, '').trim();
            const emojiMap = buildEmojiMap(actualEmojiTags);
            const parsedSegments = parseContentToSegments(cleanedContent, emojiMap);
            const groupedImages = groupConsecutiveImages(parsedSegments);
            return groupConsecutiveLinks(groupedImages);
        },
        get content() {
            const actualContent = String(config().event?.content ?? config().content ?? '');
            return actualContent.replace(/\[Image #\d+\]/gi, '').trim();
        },
        get emojiMap() {
            const event = config().event;
            const actualEmojiTags = (event?.tags && Array.isArray(event.tags))
                ? event.tags.filter(t => t[0] === 'emoji')
                : (config().emojiTags ?? []);
            return buildEmojiMap(actualEmojiTags);
        },
    };
}

export interface EmbeddedEventState {
    event: NDKEvent | null;
    loading: boolean;
    error: string | null;
}

export interface EmbeddedEventConfig {
    bech32: string;
}

/**
 * Create reactive state for fetching and displaying an embedded event
 *
 * Handles fetching events from bech32 references (note1, nevent1, naddr1).
 *
 * @example
 * ```ts
 * // NDK from context
 * const embedded = createEmbeddedEvent(() => ({ bech32: 'note1...' }));
 *
 * // Or with explicit NDK
 * const embedded = createEmbeddedEvent(() => ({ bech32: 'note1...' }), ndk);
 *
 * // Access state
 * embedded.event // The fetched event
 * embedded.loading // Loading state
 * embedded.error // Error message if any
 * ```
 */
export function createEmbeddedEvent(
    config: () => EmbeddedEventConfig,
    ndk?: NDKSvelte
): EmbeddedEventState {
    const resolvedNDK = resolveNDK(ndk);
    let fetchedEvent = $state<NDKEvent | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);

    $effect(() => {
        const { bech32: currentBech32 } = config();
        if (!currentBech32) return;

        loading = true;
        error = null;

        resolvedNDK.fetchEvent(currentBech32)
            .then(event => {
                if (event) {
                    fetchedEvent = event;
                } else {
                    error = 'Event not found';
                }
                loading = false;
            })
            .catch(err => {
                console.error('Failed to fetch embedded event:', err);
                error = 'Failed to load event';
                loading = false;
            });
    });

    return {
        get event() {
            return fetchedEvent;
        },
        get loading() {
            return loading;
        },
        get error() {
            return error;
        },
    };
}

// Re-export utilities
export * from './utils.js';
