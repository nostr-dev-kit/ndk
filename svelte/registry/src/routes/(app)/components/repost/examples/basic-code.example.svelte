<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createRepostAction } from '$lib/registry/builders/repost-action.svelte.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const repostState = createRepostAction(() => ({ event }), ndk);
</script>

<button
  onclick={repostState.repost}
  class={`inline-flex items-center gap-2 p-2 ${
    repostState.hasReposted ? 'text-green-500' : ''
  }`}
>
  🔄 {repostState.count > 0 ? repostState.count : ''}
</button>
