<script lang="ts">
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createRepostAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    ndk?: NDKSvelte;
    event?: NDKEvent;
    showCount?: boolean;
    class?: string;
  }

  let { ndk: ndkProp, event: eventProp, showCount = true, class: className = '' }: Props = $props();

  const EVENT_CARD_CONTEXT_KEY = Symbol.for('event-card');
  const ctx = getContext<any>(EVENT_CARD_CONTEXT_KEY);
  const ndk = $derived(ndkProp || ctx?.ndk);
  const event = $derived(eventProp || ctx?.event);

  const repostState = createRepostAction(() => ({ event }), ndk);

  async function handleRepost() {
    if (!ndk?.$currentPubkey) {
      return;
    }
    try {
      await repostState.repost();
    } catch (error) {
      console.error('Failed to repost:', error);
    }
  }
</script>

<button
  onclick={handleRepost}
  class={cn(
    'inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-colors',
    repostState.hasReposted && 'text-green-500',
    className
  )}
  aria-label={`Repost (${repostState.count})`}
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none" class="flex-shrink-0">
    <path d="M16.3884 3L17.3913 3.97574C17.8393 4.41165 18.0633 4.62961 17.9844 4.81481C17.9056 5 17.5888 5 16.9552 5H9.19422C5.22096 5 2 8.13401 2 12C2 13.4872 2.47668 14.8662 3.2895 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M7.61156 21L6.60875 20.0243C6.16074 19.5883 5.93673 19.3704 6.01557 19.1852C6.09441 19 6.4112 19 7.04478 19H14.8058C18.779 19 22 15.866 22 12C22 10.5128 21.5233 9.13383 20.7105 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
  {#if showCount && repostState.count > 0}
    <span class="text-sm font-medium">{repostState.count}</span>
  {/if}
</button>
