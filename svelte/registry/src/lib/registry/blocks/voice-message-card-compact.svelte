<!-- @ndk-version: voice-message-card-compact@0.1.0 -->
<script lang="ts">
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { VoiceMessage } from '../ui/voice-message/index.js';
  import { User } from '../ui/user';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Voice message to display */
    voiceMessage: NDKVoiceMessage;

    /** Show author information */
    showAuthor?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    voiceMessage,
    showAuthor = false,
    class: className = ''
  }: Props = $props();
</script>

<VoiceMessage.Root {ndk} {voiceMessage}>
  <div class="voice-message-compact {className}">
    {#if showAuthor}
      <div class="author-section">
        <User.Root user={voiceMessage.author}>
          <User.Avatar size={32} />
          <User.Name />
        </User.Root>
      </div>
    {/if}

    <div class="player-section">
      <VoiceMessage.Player showButton={true} />
      <VoiceMessage.Duration />
    </div>
  </div>
</VoiceMessage.Root>

<style>
  .voice-message-compact {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
  }

  .author-section {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .player-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }
</style>
