<!-- @ndk-version: voice-message-card@0.1.0 -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { VOICE_MESSAGE_CARD_CONTEXT_KEY, type VoiceMessageCardContext } from './context.svelte.js';

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Show avatar */
    showAvatar?: boolean;

    /** Avatar size in pixels */
    avatarSize?: number;
  }

  let {
    class: className = '',
    showAvatar = false,
    avatarSize = 24
  }: Props = $props();

  const context = getContext<VoiceMessageCardContext>(VOICE_MESSAGE_CARD_CONTEXT_KEY);

  const displayName = $derived(
    context.authorProfile?.profile?.displayName ||
    context.authorProfile?.profile?.name ||
    context.voiceMessage.author?.npub.slice(0, 12) + '...' ||
    'Anonymous'
  );

  const avatar = $derived(context.authorProfile?.profile?.image);
</script>

<div class="voice-message-author {className}">
  {#if showAvatar && avatar}
    <img
      src={avatar}
      alt={displayName}
      class="author-avatar"
      style="width: {avatarSize}px; height: {avatarSize}px;"
    />
  {/if}
  <span class="author-name">{displayName}</span>
</div>

<style>
  .voice-message-author {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .author-avatar {
    border-radius: 50%;
    object-fit: cover;
  }

  .author-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--foreground);
  }
</style>
