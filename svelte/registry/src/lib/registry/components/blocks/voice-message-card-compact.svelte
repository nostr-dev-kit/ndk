<!-- @ndk-version: voice-message-card-compact@0.1.0 -->
<script lang="ts">
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { VoiceMessageCard } from '../voice-message-card/index.js';
  import { UserProfile } from '../user-profile/index.js';

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

<VoiceMessageCard.Root {ndk} {voiceMessage}>
  <div class="voice-message-compact {className}">
    {#if showAuthor}
      <div class="author-section">
        <UserProfile.Root {ndk} user={voiceMessage.author}>
          <UserProfile.Avatar size={32} />
          <UserProfile.Name />
        </UserProfile.Root>
      </div>
    {/if}

    <div class="player-section">
      <VoiceMessageCard.Player showButton={true} />
      <VoiceMessageCard.Duration />
    </div>
  </div>
</VoiceMessageCard.Root>

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
