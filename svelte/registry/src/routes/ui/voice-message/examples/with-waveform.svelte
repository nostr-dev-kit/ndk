<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import { VoiceMessage } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  let voiceMessage = $state<NDKVoiceMessage | null>(null);
</script>

<div class="waveform-demo">
  {#if voiceMessage}
    <VoiceMessage.Root {ndk} {voiceMessage}>
      <div class="player-card">
        <div class="player-controls">
          <VoiceMessage.Player />
          <VoiceMessage.Duration />
        </div>
        <VoiceMessage.Waveform class="waveform" />
      </div>
    </VoiceMessage.Root>
  {:else}
    <div class="placeholder">
      <p>Load a voice message to see waveform visualization</p>
    </div>
  {/if}
</div>

<style>
  .waveform-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    background: white;
  }

  .player-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 0.75rem;
    color: white;
  }

  .player-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .player-card :global(.waveform) {
    height: 60px;
    border-radius: 0.375rem;
    background: rgba(255, 255, 255, 0.1);
  }

  .placeholder {
    padding: 2rem;
    text-align: center;
    color: #6b7280;
  }
</style>
