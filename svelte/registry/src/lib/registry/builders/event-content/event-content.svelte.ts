import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
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
 * - User mentions (npub/nprofile → "mention" type)
 * - Event references (note, nevent, naddr)
 * - Media (images, videos, YouTube embeds)
 * - Custom emojis
 * - Hashtags
 * - Links
 *
 * @example
 * ```ts
 * const content = createEventContent(() => ({ event: myEvent }));
 *
 * // Access parsed segments
 * content.segments // Array of parsed segments
 * content.content // Cleaned content string
 * content.emojiMap // Map of emoji shortcodes to URLs
 * ```
 */
export function createEventContent(
    config: () => EventContentConfig
): EventContentState {
    return {
        get segments() {
            const actualContent = String(config().event?.content ?? config().content ?? '');
            const event = config().event;
            const actualEmojiTags = (event?.tags && Array.isArray(event.tags))
                ? event.tags.filter(t => t[0] === 'emoji')
                : (config().emojiTags ?? []);

            const emojiMap = buildEmojiMap(actualEmojiTags);
            const parsedSegments = parseContentToSegments(actualContent, emojiMap);
            const groupedImages = groupConsecutiveImages(parsedSegments);
            return groupConsecutiveLinks(groupedImages);
        },
        get content() {
            const actualContent = String(config().event?.content ?? config().content ?? '');
            return actualContent.trim();
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

