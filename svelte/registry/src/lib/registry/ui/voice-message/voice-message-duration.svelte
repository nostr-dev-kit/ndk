<!-- @ndk-version: voice-message@0.1.0 -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { VOICE_MESSAGE_CONTEXT_KEY, type VoiceMessageContext } from './context.svelte.js';

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Show current time instead of total duration */
    showCurrent?: boolean;

    /** Current time in seconds (for external control) */
    currentTime?: number;
  }

  let {
    class: className = '',
    showCurrent = false,
    currentTime = 0
  }: Props = $props();

  const context = getContext<VoiceMessageContext>(VOICE_MESSAGE_CONTEXT_KEY);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  const duration = $derived(context.voiceMessage.duration || 0);
  const displayTime = $derived(showCurrent ? formatTime(currentTime) : formatTime(duration));
</script>

<span class="voice-message-duration {className}">
  {displayTime}
</span>

<style>
  .voice-message-duration {
    font-variant-numeric: tabular-nums;
  }
</style>
