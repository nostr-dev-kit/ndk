import type { NDKSvelte, RelayInfoState } from '@nostr-dev-kit/svelte';

/**
 * Context shared between RelayCard components
 */
export interface RelayCardContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Relay URL */
    relayUrl: string;

    /** Relay info state (NIP-11) */
    relayInfo: RelayInfoState;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;
}

export const RELAY_CARD_CONTEXT_KEY = Symbol('relay-card');
