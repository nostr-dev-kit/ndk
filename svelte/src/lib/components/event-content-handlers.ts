/**
 * Handler registry for EventContent event callbacks
 *
 * Allows developers to set global handlers for different interaction types
 * instead of passing them as props to every EventContent instance.
 *
 * @example
 * ```ts
 * import EventContent from '@nostr-dev-kit/svelte';
 *
 * // Set global handlers via static property
 * EventContent.handlers.onMentionClick = (bech32) => navigate(`/p/${bech32}`);
 * EventContent.handlers.onHashtagClick = (tag) => navigate(`/hashtag/${tag}`);
 *
 * // Then use EventContent without handler props
 * <EventContent {ndk} {content} />
 *
 * // Or override for specific instances
 * <EventContent {ndk} {content} handlers={{ onMentionClick: customHandler }} />
 * ```
 */

import type { NDKEvent } from "@nostr-dev-kit/ndk";

/**
 * Registry of event handlers for EventContent interactions
 */
export interface EventContentHandlers {
    /** Handler when a user mention (npub/nprofile) is clicked */
    onMentionClick?: (bech32: string) => void;
    /** Handler when an event reference (note1/nevent1/naddr1) is clicked */
    onEventClick?: (bech32: string, event: NDKEvent) => void;
    /** Handler when a hashtag is clicked */
    onHashtagClick?: (tag: string) => void;
    /** Handler when a regular URL link is clicked */
    onLinkClick?: (url: string) => void;
}

// Global handlers registry
const globalHandlers: EventContentHandlers = {};

/**
 * Merge handler registries, with later arguments taking precedence
 * Used internally to merge global handlers with instance handlers
 */
export function mergeHandlerRegistries(...registries: Partial<EventContentHandlers>[]): EventContentHandlers {
    // Filter out undefined values from the registries
    const filtered = registries.map((registry) => {
        const clean: Partial<EventContentHandlers> = {};
        for (const [key, value] of Object.entries(registry)) {
            if (value !== undefined) {
                clean[key as keyof EventContentHandlers] = value;
            }
        }
        return clean;
    });

    return Object.assign({}, globalHandlers, ...filtered);
}

/**
 * Proxy for static handlers property on EventContent
 * This allows: EventContent.handlers.onMentionClick = handler
 */
export const EventContentHandlersProxy = new Proxy(
    {},
    {
        get(_target, prop: string) {
            return globalHandlers[prop as keyof EventContentHandlers];
        },
        set(_target, prop: string, value: any) {
            globalHandlers[prop as keyof EventContentHandlers] = value;
            return true;
        },
    },
);
