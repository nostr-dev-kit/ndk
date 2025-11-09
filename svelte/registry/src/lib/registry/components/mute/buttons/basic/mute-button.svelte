<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createMuteAction } from '../../../../builders/mute-action/index.svelte.js';
  import { getContext } from 'svelte';
  import { cn } from '../../../../utils/cn';
  import { User } from '../../../../ui/user/index.js';

  interface Props {
    ndk?: NDKSvelte;
    target: NDKUser | string;
    showIcon?: boolean;
    showTarget?: boolean;
    class?: string;
  }

  let { ndk: ndkProp, target, showIcon = true, showTarget = false, class: className = '' }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;

  const isOwnProfile = $derived.by(() => {
    if (!ndk?.$currentPubkey || typeof target === 'string') return false;
    try {
      return ndk.$currentPubkey === (target as NDKUser).pubkey;
    } catch {
      return false;
    }
  });

  const muteAction = createMuteAction(() => ({ target }), ndk);

  async function handleToggle() {
    if (!ndk?.$currentPubkey) return;
    try {
      await muteAction.mute();
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }
</script>

{#if !isOwnProfile && ndk?.$currentUser}
  <button
    data-mute-button=""
    data-muted={muteAction.isMuted ? '' : undefined}
    type="button"
    onclick={handleToggle}
    class={cn(
      'inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-colors',
      muteAction.isMuted ? 'text-red-500' : 'text-muted-foreground hover:text-foreground',
      className
    )}
    aria-label={muteAction.isMuted ? 'Unmute user' : 'Mute user'}
  >
    {#if showTarget && typeof target !== 'string'}
      <User.Root {ndk} user={target as NDKUser} class="flex items-center gap-2">
        <User.Avatar class="w-5 h-5" />
        <span class="text-sm inline-flex items-baseline gap-1">
          <span class="font-bold">{muteAction.isMuted ? 'Unmute' : 'Mute'}</span>
          <User.Name field="displayName" class="text-sm font-normal" />
        </span>
      </User.Root>
    {:else}
      {#if showIcon}
        {#if muteAction.isMuted}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="flex-shrink-0"
          >
            <path d="M3 3L21 21" stroke-width="2" stroke-linecap="round" ></path>
            <path d="M15 9C15.6254 9.6367 16 10.4906 16 11.4286C16 12.3666 15.6254 13.2205 15 13.8571M18 6C19.5 7.5 20 9.5 20 12C20 13.5 19.5 15 18.5 16.5" ></path>
            <path d="M11 6.13481C11.3154 6.06028 11.65 6 12 6C14.2091 6 16 7.79086 16 10V14C16 16.2091 14.2091 18 12 18C11.65 18 11.3154 17.9397 11 17.8652V6.13481Z" ></path>
            <path d="M6 10H4C2.89543 10 2 10.8954 2 12V12C2 13.1046 2.89543 14 4 14H6L11 18V6L9 7.6" ></path>
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="flex-shrink-0"
          >
            <path d="M15 9C15.6254 9.6367 16 10.4906 16 11.4286C16 12.3666 15.6254 13.2205 15 13.8571M18 6C19.5 7.5 20 9.5 20 12C20 14.5 19.5 16.5 18 18" ></path>
            <path d="M12 6C14.2091 6 16 7.79086 16 10V14C16 16.2091 14.2091 18 12 18C11.65 18 11.3154 17.9397 11 17.8652V6.13481C11.3154 6.06028 11.65 6 12 6Z" ></path>
            <path d="M6 10H4C2.89543 10 2 10.8954 2 12V12C2 13.1046 2.89543 14 4 14H6L11 18V6L6 10Z" ></path>
          </svg>
        {/if}
      {/if}
      <span class="text-sm font-medium">
        {muteAction.isMuted ? 'Unmute' : 'Mute'}
      </span>
    {/if}
  </button>
{/if}
