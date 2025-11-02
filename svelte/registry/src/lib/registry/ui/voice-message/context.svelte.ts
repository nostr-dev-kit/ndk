// @ndk-version: voice-message@0.1.0
import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * Context shared between VoiceMessage components
 */
export interface VoiceMessageContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The voice message being displayed */
    voiceMessage: NDKVoiceMessage;

    /** Whether the card is interactive (clickable) */
    interactive: boolean;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;
}

export const VOICE_MESSAGE_CONTEXT_KEY = Symbol('voice-message');
