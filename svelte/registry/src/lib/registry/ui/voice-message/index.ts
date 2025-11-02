// @ndk-version: voice-message@0.1.0
import Root from './voice-message-root.svelte';
import Player from './voice-message-player.svelte';
import Waveform from './voice-message-waveform.svelte';
import Duration from './voice-message-duration.svelte';

export { type VoiceMessageContext } from './context.svelte.js';

export const VoiceMessage = {
    Root,
    Player,
    Waveform,
    Duration
};
