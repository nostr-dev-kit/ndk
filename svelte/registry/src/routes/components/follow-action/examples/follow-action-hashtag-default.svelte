<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import FollowAction from '$lib/ndk/actions/follow-action.svelte';

  interface Props {
    ndk: NDKSvelte;
    hashtag: string;
    onfollowsuccess: (e: Event) => void;
    onfollowerror: (e: Event) => void;
  }

  let { ndk, hashtag, onfollowsuccess, onfollowerror }: Props = $props();
</script>

<div class="flex items-center gap-3 px-4 py-2 bg-background border border-border rounded-lg">
  <span class="text-2xl font-bold text-primary">#</span>
  <span class="text-lg font-semibold text-foreground">{hashtag}</span>
  <FollowAction
    {ndk}
    target={hashtag}
    {onfollowsuccess}
    {onfollowerror}
  />
</div>
