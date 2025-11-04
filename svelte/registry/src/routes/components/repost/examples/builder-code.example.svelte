<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createRepostAction } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const repostState = createRepostAction(() => ({ event }), ndk);
</script>

<button
  class={`px-6 py-3 rounded-xl border transition-all ${
    repostState.hasReposted
      ? 'border-green-500 bg-green-500/5 text-green-600'
      : 'bg-card border-border hover:bg-accent'
  }`}
  onclick={repostState.repost}
>
  <div class="flex items-center gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M16.3884 3L17.3913 3.97574C17.8393 4.41165 18.0633 4.62961 17.9844 4.81481C17.9056 5 17.5888 5 16.9552 5H9.19422C5.22096 5 2 8.13401 2 12C2 13.4872 2.47668 14.8662 3.2895 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M7.61156 21L6.60875 20.0243C6.16074 19.5883 5.93673 19.3704 6.01557 19.1852C6.09441 19 6.4112 19 7.04478 19H14.8058C18.779 19 22 15.866 22 12C22 10.5128 21.5233 9.13383 20.7105 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <div class="flex flex-col items-start">
      <span class="font-semibold">{repostState.hasReposted ? 'Reposted' : 'Repost'}</span>
      {#if repostState.count > 0}
        <span class="text-sm text-muted-foreground">{repostState.count} reposts</span>
      {/if}
    </div>
  </div>
</button>
