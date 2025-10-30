// @ndk-version: voice-message-card@0.1.0
/**
 * VoiceMessageCard - Composable voice message card components
 *
 * A flexible system for displaying NDKVoiceMessage content with audio playback and waveform visualization.
 * Components support context mode (within VoiceMessageCard.Root) for composable layouts.
 *
 * The `ndk` prop is optional on Root components - if not provided, it will be retrieved from Svelte context.
 *
 * @example Composable mode (ndk from context):
 * ```svelte
 * <VoiceMessageCard.Root {voiceMessage}>
 *   <div class="card">
 *     <VoiceMessageCard.Author showAvatar={true} />
 *     <VoiceMessageCard.Waveform height={60} />
 *     <VoiceMessageCard.Player />
 *     <VoiceMessageCard.Duration />
 *   </div>
 * </VoiceMessageCard.Root>
 * ```
 *
 * @example Using preset blocks (import separately from blocks):
 * ```svelte
 * import { VoiceMessageCardCompact, VoiceMessageCardExpanded } from '$lib/ndk/blocks';
 *
 * <VoiceMessageCardCompact {ndk} {voiceMessage} />
 * <VoiceMessageCardExpanded {ndk} {voiceMessage} showWaveform={true} />
 * ```
 */

// Core components
import Root from './voice-message-card-root.svelte';
import Player from './voice-message-card-player.svelte';
import Waveform from './voice-message-card-waveform.svelte';
import Duration from './voice-message-card-duration.svelte';
import Author from './voice-message-card-author.svelte';

// Export as namespace for dot notation
export const VoiceMessageCard = {
  Root,
  Player,
  Waveform,
  Duration,
  Author,
};

// Export types
export type { VoiceMessageCardContext } from './context.svelte.js';
