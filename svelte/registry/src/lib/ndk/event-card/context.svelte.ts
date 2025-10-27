import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte, ThreadingMetadata } from '@nostr-dev-kit/svelte';

/**
 * Context shared between EventCard components
 */
export interface EventCardContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The event being displayed */
    event: NDKEvent;

    /** Threading metadata for UI rendering */
    threading?: ThreadingMetadata;

    /** Whether the card is interactive (clickable) */
    interactive: boolean;
}

export const EVENT_CARD_CONTEXT_KEY = Symbol.for('event-card');