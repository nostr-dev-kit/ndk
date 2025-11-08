// @ndk-version: highlight@0.7.0
/**
 * Context for Highlight components
 */

import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import type { HighlightState } from '@nostr-dev-kit/svelte';

export const HIGHLIGHT_CONTEXT_KEY = Symbol('highlight-context');

export interface HighlightContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The highlight event */
    event: NDKEvent;

    /** Highlight state from builder */
    state: HighlightState;
}
