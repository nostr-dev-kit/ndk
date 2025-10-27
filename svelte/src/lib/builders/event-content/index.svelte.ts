import type NDKEvent from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';
import {
    buildEmojiMap,
    parseContentToSegments,
    groupConsecutiveImages,
    type ParsedSegment,
} from './utils.js';

export interface EventContentState {
    segments: ParsedSegment[];
    content: string;
    emojiMap: Map<string, string>;
}

export interface CreateEventContentProps {
    ndk: NDKSvelte;
    event?: () => NDKEvent | undefined;
    content?: () => string | undefined;
    emojiTags?: () => string[][] | undefined;
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
 * const content = createEventContent({ ndk, event: () => myEvent });
 *
 * // Access parsed segments
 * content.segments // Array of parsed segments
 * content.content // Cleaned content string
 * content.emojiMap // Map of emoji shortcodes to URLs
 * ```
 */
export function createEventContent(props: CreateEventContentProps): EventContentState {
    const actualContent = $derived(props.event?.()?.content ?? props.content?.() ?? '');
    const actualEmojiTags = $derived(
        props.event?.() ? props.event().tags.filter(t => t[0] === 'emoji') : (props.emojiTags?.() ?? [])
    );

    const cleanedContent = $derived(actualContent.replace(/\[Image #\d+\]/gi, '').trim());
    const emojiMap = $derived(buildEmojiMap(actualEmojiTags));
    const parsedSegments = $derived(parseContentToSegments(cleanedContent, emojiMap));
    const segments = $derived(groupConsecutiveImages(parsedSegments));

    return {
        get segments() {
            return segments;
        },
        get content() {
            return cleanedContent;
        },
        get emojiMap() {
            return emojiMap;
        },
    };
}

export interface EmbeddedEventState {
    event: NDKEvent | null;
    loading: boolean;
    error: string | null;
}

export interface CreateEmbeddedEventProps {
    ndk: NDKSvelte;
    bech32: () => string;
}

/**
 * Create reactive state for fetching and displaying an embedded event
 *
 * Handles fetching events from bech32 references (note1, nevent1, naddr1).
 *
 * @example
 * ```ts
 * const embedded = createEmbeddedEvent({ ndk, bech32: () => 'note1...' });
 *
 * // Access state
 * embedded.event // The fetched event
 * embedded.loading // Loading state
 * embedded.error // Error message if any
 * ```
 */
export function createEmbeddedEvent(props: CreateEmbeddedEventProps): EmbeddedEventState {
    let fetchedEvent = $state<NDKEvent | null>(null);
    let loading = $state(true);
    let error = $state<string | null>(null);

    $effect(() => {
        const currentBech32 = props.bech32();
        if (!currentBech32 || !props.ndk) return;

        loading = true;
        error = null;

        props.ndk.fetchEvent(currentBech32)
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
