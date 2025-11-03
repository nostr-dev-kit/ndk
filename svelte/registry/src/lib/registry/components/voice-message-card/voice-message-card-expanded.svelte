<!-- @ndk-version: voice-message-card-expanded@0.1.0 -->
<script lang="ts">
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { VoiceMessage } from '../../ui/voice-message/index.js';
  import { User } from '../../ui/user';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Voice message to display */
    voiceMessage: NDKVoiceMessage;

    /** Show waveform visualization */
    showWaveform?: boolean;

    /** Waveform height */
    waveformHeight?: number;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    voiceMessage,
    showWaveform = true,
    waveformHeight = 60,
    class: className = ''
  }: Props = $props();

  let audioRef = $state<HTMLAudioElement>();
  let currentTime = $state(0);
  let duration = $state(0);

  $effect(() => {
    if (!audioRef) return;

    const handleTimeUpdate = () => {
      currentTime = audioRef!.currentTime;
      duration = audioRef!.duration || voiceMessage.duration || 0;
    };

    audioRef.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.addEventListener('loadedmetadata', handleTimeUpdate);

    return () => {
      audioRef?.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef?.removeEventListener('loadedmetadata', handleTimeUpdate);
    };
  });

  const progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);
</script>

<VoiceMessage.Root {ndk} {voiceMessage}>
  <div class="voice-message-expanded {className}">
    <div class="header">
      <User.Root {ndk} user={voiceMessage.author}>
        <User.Avatar class="w-10 h-10" />
        <User.Name />
      </User.Root>
      <VoiceMessage.Duration {currentTime} showCurrent={true} />
    </div>

    {#if showWaveform}
      <div class="waveform-section">
        <VoiceMessage.Waveform height={waveformHeight} {progress} />
      </div>
    {/if}

    <div class="controls">
      <VoiceMessage.Player bind:audioRef />
    </div>
  </div>
</VoiceMessage.Root>

<style>
  .voice-message-expanded {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .waveform-section {
    padding: 8px 0;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }
</style>
