<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { VOICE_MESSAGE_CONTEXT_KEY, type VoiceMessageContext } from './context.svelte.js';
  import { mergeProps } from '../../utils/index.js';

  interface PlayerSnippetProps {
    isPlaying: boolean;
    progress: number;
    currentTime: number;
    duration: number;
    togglePlayPause: () => void;
    seek: (e: MouseEvent) => void;
  }

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Audio element ref (for external control) */
    audioRef?: HTMLAudioElement | undefined;

    /** Child snippet for custom element rendering */
    child?: Snippet<[{ props: any } & PlayerSnippetProps]>;

    /** Content snippet for custom content */
    children?: Snippet<[PlayerSnippetProps]>;
  }

  let {
    class: className = '',
    audioRef = $bindable(),
    child,
    children,
    ...restProps
  }: Props = $props();

  const context = getContext<VoiceMessageContext>(VOICE_MESSAGE_CONTEXT_KEY);
  if (!context) {
    throw new Error('VoiceMessage.Player must be used within VoiceMessage.Root');
  }

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

  const mergedProps = $derived(mergeProps(restProps, {
    'aria-label': isPlaying ? 'Pause voice message' : 'Play voice message',
    'data-playing': isPlaying,
    'data-progress': Math.round(progress),
    class: className
  }));

  const snippetProps = $derived({
    isPlaying,
    progress,
    currentTime: Math.round(currentTime),
    duration: Math.round(duration),
    togglePlayPause,
    seek: handleSeek
  });
</script>

{#if child}
  {@render child({ props: mergedProps, ...snippetProps })}
{:else}
  <div {...mergedProps}>
    {#if children}
      {@render children(snippetProps)}
    {:else}
      <button
        type="button"
        onclick={togglePlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <div
        onclick={handleSeek}
        role="slider"
        aria-label="Seek"
        aria-valuenow={Math.round(currentTime)}
        aria-valuemin="0"
        aria-valuemax={Math.round(duration)}
        tabindex="0"
        style="flex: 1; cursor: pointer;"
      >
        <div style="width: {progress}%; background: currentColor; height: 2px;"></div>
      </div>
    {/if}
  </div>
{/if}

<audio
  bind:this={audioElement}
  src={context.voiceMessage.url}
  ontimeupdate={handleTimeUpdate}
  onloadedmetadata={handleLoadedMetadata}
  onplay={handlePlay}
  onpause={handlePause}
  style="display: none;"
>
  <track kind="captions" />
</audio>
