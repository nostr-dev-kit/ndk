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

  const muteState = createMuteAction(() => ({ target }), ndk);

  async function handleToggle() {
    if (!ndk.$currentPubkey) {
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
  class={cn(
    'inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-colors',
    muteState.isMuted && 'text-red-500',
    className
  )}
  aria-label={muteState.isMuted ? 'Unmute' : 'Mute'}
>
  {#if muteState.isMuted}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
      <path d="M3 3L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M15 9C15.6254 9.6367 16 10.4906 16 11.4286C16 12.3666 15.6254 13.2205 15 13.8571M18 6C19.5 7.5 20 9.5 20 12C20 13.5 19.5 15 18.5 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11 6.13481C11.3154 6.06028 11.65 6 12 6C14.2091 6 16 7.79086 16 10V14C16 16.2091 14.2091 18 12 18C11.65 18 11.3154 17.9397 11 17.8652V6.13481Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 10H4C2.89543 10 2 10.8954 2 12V12C2 13.1046 2.89543 14 4 14H6L11 18V6L9 7.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
      <path d="M15 9C15.6254 9.6367 16 10.4906 16 11.4286C16 12.3666 15.6254 13.2205 15 13.8571M18 6C19.5 7.5 20 9.5 20 12C20 14.5 19.5 16.5 18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 6C14.2091 6 16 7.79086 16 10V14C16 16.2091 14.2091 18 12 18C11.65 18 11.3154 17.9397 11 17.8652V6.13481C11.3154 6.06028 11.65 6 12 6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 10H4C2.89543 10 2 10.8954 2 12V12C2 13.1046 2.89543 14 4 14H6L11 18V6L6 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  {/if}
  <span>{muteState.isMuted ? 'Unmute' : 'Mute'}</span>
</button>
