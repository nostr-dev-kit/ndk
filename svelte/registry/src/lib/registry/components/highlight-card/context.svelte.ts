// @ndk-version: highlight-card@0.7.0
/**
 * Context for HighlightCard components
 */

import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import type { HighlightState } from '@nostr-dev-kit/svelte';

export const HIGHLIGHT_CARD_CONTEXT_KEY = Symbol('highlight-card-context');

export interface HighlightCardContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The highlight event */
    event: NDKEvent;

    /** Highlight state from builder */
    state: HighlightState;

    /** Display variant */
    variant: 'feed' | 'compact' | 'grid';
}
