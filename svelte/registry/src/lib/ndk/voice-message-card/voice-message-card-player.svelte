<!-- @ndk-version: voice-message-card@0.1.0 -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { VOICE_MESSAGE_CARD_CONTEXT_KEY, type VoiceMessageCardContext } from './context.svelte.js';
  import PlayIcon from '$lib/icons/play.svelte';
  import PauseIcon from '$lib/icons/pause.svelte';

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Show play/pause button */
    showButton?: boolean;

    /** Audio element ref (for external control) */
    audioRef?: HTMLAudioElement | undefined;
  }

  let {
    class: className = '',
    showButton = true,
    audioRef = $bindable()
  }: Props = $props();

  const context = getContext<VoiceMessageCardContext>(VOICE_MESSAGE_CARD_CONTEXT_KEY);

  let audioElement: HTMLAudioElement;
  let isPlaying = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);

  $effect(() => {
    audioRef = audioElement;
  });

  function togglePlayPause() {
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
  }

  function handleTimeUpdate() {
    currentTime = audioElement.currentTime;
  }

  function handleLoadedMetadata() {
    duration = audioElement.duration || context.voiceMessage.duration || 0;
  }

  function handlePlay() {
    isPlaying = true;
  }

  function handlePause() {
    isPlaying = false;
  }

  function handleSeek(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioElement.currentTime = pos * duration;
  }

  const progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);
</script>

<div class="voice-message-player {className}">
  {#if showButton}
    <button
      type="button"
      class="play-button"
      onclick={togglePlayPause}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {#if isPlaying}
        <PauseIcon size={20} />
      {:else}
        <PlayIcon size={20} />
      {/if}
    </button>
  {/if}

  <div class="progress-container" onclick={handleSeek}>
    <div class="progress-bar" style="width: {progress}%"></div>
  </div>

  <audio
    bind:this={audioElement}
    src={context.voiceMessage.url}
    ontimeupdate={handleTimeUpdate}
    onloadedmetadata={handleLoadedMetadata}
    onplay={handlePlay}
    onpause={handlePause}
  >
    <track kind="captions" />
  </audio>
</div>

<style>
  .voice-message-player {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .play-button {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--foreground);
    cursor: pointer;
    transition: all 0.2s;
  }

  .play-button:hover {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  .progress-container {
    flex: 1;
    height: 6px;
    background: var(--muted);
    border-radius: 3px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: var(--primary);
    border-radius: 3px;
    transition: width 0.1s linear;
  }
</style>
