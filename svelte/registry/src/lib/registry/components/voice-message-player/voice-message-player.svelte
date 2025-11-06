<script lang="ts">
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { VoiceMessage } from '../../ui/voice-message';
  import PlayIcon from '../../icons/play.svelte';
  import PauseIcon from '../../icons/pause.svelte';

  interface Props {
    ndk: NDKSvelte;

    voiceMessage: NDKVoiceMessage;

    showButton?: boolean;

    audioRef?: HTMLAudioElement | undefined;

    class?: string;
  }

  let {
    ndk,
    voiceMessage,
    showButton = true,
    audioRef = $bindable(),
    class: className = ''
  }: Props = $props();

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
    duration = audioElement.duration || voiceMessage.duration || 0;
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

<VoiceMessage.Root {ndk} {voiceMessage}>
  <div data-voice-message-player="" class="voice-message-player {className}">
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
      src={voiceMessage.url}
      ontimeupdate={handleTimeUpdate}
      onloadedmetadata={handleLoadedMetadata}
      onplay={handlePlay}
      onpause={handlePause}
    >
      <track kind="captions" />
    </audio>
  </div>
</VoiceMessage.Root>

<style>
  .voice-message-player {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .play-button {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .progress-container {
    flex: 1;
    cursor: pointer;
    position: relative;
  }

  .progress-bar {
    height: 100%;
  }
</style>
