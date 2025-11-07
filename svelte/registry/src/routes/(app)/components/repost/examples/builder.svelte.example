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

<div class="bg-card border border-border rounded-xl p-6">
  <div class="mb-4">
    <p class="m-0 leading-relaxed text-foreground">{event.content}</p>
  </div>
  <div class="flex gap-2 pt-4 border-t border-border">
    <button
      class={`px-4 py-2 rounded-lg border transition-colors hover:bg-accent ${
        repostState.hasReposted
          ? 'border-primary bg-primary/10'
          : 'bg-muted'
      }`}
      onclick={repostState.repost}
    >
      🔄 Repost ({repostState.count})
    </button>
  </div>
</div>


