<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import ReactionAction from '$lib/ndk/actions/reaction-action.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div class="bg-card border border-border rounded-xl p-6 shadow-sm">
  <div class="flex gap-2 pt-4 border-t border-border">
    <ReactionAction {ndk} {event} />
  </div>
</div>
