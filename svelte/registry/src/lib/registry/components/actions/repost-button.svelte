<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createRepostAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '../../utils/index.js';
  import RepostIcon from '../../icons/repost.svelte';

  interface Props {
    ndk?: NDKSvelte;
    event: NDKEvent;
    showCount?: boolean;
    class?: string;
  }

  let { ndk: ndkProp, event, showCount = true, class: className = '' }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;

  const repostState = createRepostAction(() => ({ event }), ndk);

  async function handleRepost() {
    if (!ndk?.$currentPubkey) return;
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
  <RepostIcon class="flex-shrink-0" />
  {#if showCount && repostState.count > 0}
    <span class="text-sm font-medium">{repostState.count}</span>
  {/if}
</button>
