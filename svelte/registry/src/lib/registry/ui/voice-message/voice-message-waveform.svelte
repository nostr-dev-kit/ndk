<script lang="ts">
  import { getContext } from 'svelte';
  import { VOICE_MESSAGE_CONTEXT_KEY, type VoiceMessageContext } from './voice-message.context.js';

  interface Props {
    class?: string;

    height?: number;

    barColor?: string;

    progressColor?: string;

    barGap?: number;

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
  <div class="flex items-center w-full {className}" style="height: {height}px;">
    {#each waveform as value, i (i)}
      {@const barHeight = getBarHeight(value)}
      {@const isPlayed = (i / waveform.length) * 100 < progress}
      <div
        class="flex-1"
        style="
          height: {barHeight}px;
          background: {isPlayed ? progressColor : barColor};
          margin-right: {i < waveform.length - 1 ? barGap : 0}px;
        "
      ></div>
    {/each}
  </div>
{:else}
  <div class="flex items-center w-full justify-center {className}" style="height: {height}px;">
    <div class="h-[60%]" style="background: {barColor};"></div>
    <div class="h-[80%]" style="background: {barColor};"></div>
    <div class="h-[60%]" style="background: {barColor};"></div>
  </div>
{/if}
