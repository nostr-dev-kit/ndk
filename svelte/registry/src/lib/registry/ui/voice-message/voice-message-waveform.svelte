<!-- @ndk-version: voice-message@0.1.0 -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { VOICE_MESSAGE_CONTEXT_KEY, type VoiceMessageContext } from './voice-message.context.js';

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Height of the waveform in pixels */
    height?: number;

    /** Color of the bars */
    barColor?: string;

    /** Color of the progress bars */
    progressColor?: string;

    /** Gap between bars */
    barGap?: number;

    /** Progress percentage (0-100) - for external control */
    progress?: number;
  }

  let {
    class: className = '',
    height = 40,
    barColor = 'var(--muted-foreground)',
    progressColor = 'var(--primary)',
    barGap = 2,
    progress = 0
  }: Props = $props();

  const context = getContext<VoiceMessageContext>(VOICE_MESSAGE_CONTEXT_KEY);

  const waveform = $derived(context.voiceMessage.waveform || []);
  const hasWaveform = $derived(waveform.length > 0);

  function getBarHeight(value: number): number {
    const normalized = value / 100;
    return Math.max(4, normalized * height);
  }
</script>

{#if hasWaveform}
  <div class="voice-message-waveform {className}" style="height: {height}px;">
    {#each waveform as value, i (i)}
      {@const barHeight = getBarHeight(value)}
      {@const isPlayed = (i / waveform.length) * 100 < progress}
      <div
        class="waveform-bar"
        style="
          height: {barHeight}px;
          background: {isPlayed ? progressColor : barColor};
          margin-right: {i < waveform.length - 1 ? barGap : 0}px;
        "
      ></div>
    {/each}
  </div>
{:else}
  <div class="voice-message-waveform placeholder {className}" style="height: {height}px;">
    <div class="placeholder-bar" style="background: {barColor};"></div>
    <div class="placeholder-bar" style="background: {barColor};"></div>
    <div class="placeholder-bar" style="background: {barColor};"></div>
  </div>
{/if}

<style>
  .voice-message-waveform {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .waveform-bar {
    flex: 1;
  }

  .placeholder {
    justify-content: center;
  }

  .placeholder-bar {
    height: 60%;
  }

  .placeholder-bar:nth-child(2) {
    height: 80%;
  }
</style>
