<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createRepostAction } from '@nostr-dev-kit/svelte';
  import RepostAction from '$lib/ndk/actions/repost-action.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const repostState = createRepostAction(() => ({ event }), ndk);
</script>

<div class="bg-card border border-border rounded-xl p-6">
  <div class="mb-4">
    <p class="m-0 leading-relaxed text-foreground">{event.content}</p>
  </div>
  <div class="flex gap-4 items-center pt-4 border-t border-border">
    <RepostAction {ndk} {event} />
    <div class="text-sm font-medium text-muted-foreground px-3 py-2 bg-muted/50 rounded-md">
      {repostState.count} repost{repostState.count === 1 ? '' : 's'}
    </div>
  </div>
</div>
