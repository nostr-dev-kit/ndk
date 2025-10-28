<!--
  @component MuteAction
  Mute/unmute button for users.
-->
<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createMuteAction } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    ndk: NDKSvelte;
    target: NDKUser | string;
    class?: string;
  }

  const { ndk, target, class: className = '' }: Props = $props();

  const muteState = createMuteAction(() => ({ ndk, target }));

  async function handleToggle() {
    if (!ndk.$currentUser) {
      console.log('User must be logged in to mute');
      return;
    }
    try {
      await muteState.mute();
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }
</script>

<button
  onclick={handleToggle}
  class={cn('mute-action', muteState.isMuted && 'mute-action--active', className)}
  aria-label={muteState.isMuted ? 'Unmute' : 'Mute'}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    {#if muteState.isMuted}
      <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>
    {:else}
      <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    {/if}
  </svg>
  <span>{muteState.isMuted ? 'Unmute' : 'Mute'}</span>
</button>

<style>
  .mute-action {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .mute-action--active { color: #ef4444 !important; }
</style>
