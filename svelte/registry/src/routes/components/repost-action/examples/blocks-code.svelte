<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createRepostAction } from '@nostr-dev-kit/svelte';
  import RepostIcon from '$lib/ndk/icons/repost.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const repostState = createRepostAction(() => ({ event }), ndk);
</script>

<!-- Minimal repost button -->
<button
  onclick={repostState.repost}
  class="inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-colors {repostState.hasReposted ? 'text-green-500' : ''}"
>
  <RepostIcon />
  {#if repostState.count > 0}
    <span class="text-sm font-medium">{repostState.count}</span>
  {/if}
</button>

<!-- Pill variant with outline -->
<button
  onclick={repostState.repost}
  class="inline-flex items-center gap-2 px-4 py-2 cursor-pointer transition-all font-medium text-sm rounded-full {repostState.hasReposted ? 'bg-transparent border border-border text-green-500' : 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground'}"
>
  <RepostIcon size={16} />
  <span>{repostState.count > 0 ? repostState.count : 'Repost'}</span>
</button>
