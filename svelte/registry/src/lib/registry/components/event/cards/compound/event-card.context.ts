// @ndk-version: event-card@0.20.0
import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * Context shared between EventCard components
 */
export interface EventCardContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The event being displayed */
    event: NDKEvent;

    /** Whether the card is interactive (clickable) */
    interactive: boolean;
}

export const EVENT_CARD_CONTEXT_KEY = Symbol.for('event-card');