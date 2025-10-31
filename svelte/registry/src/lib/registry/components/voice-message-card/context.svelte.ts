// @ndk-version: voice-message-card@0.1.0
import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
import type { NDKSvelte, ProfileFetcherState } from '@nostr-dev-kit/svelte';

/**
 * Context shared between VoiceMessageCard components
 */
export interface VoiceMessageCardContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The voice message being displayed */
    voiceMessage: NDKVoiceMessage;

    /** Author profile fetcher (reactive) */
    authorProfile: ProfileFetcherState | null;

    /** Whether the card is interactive (clickable) */
    interactive: boolean;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;
}

export const VOICE_MESSAGE_CARD_CONTEXT_KEY = Symbol('voice-message-card');
