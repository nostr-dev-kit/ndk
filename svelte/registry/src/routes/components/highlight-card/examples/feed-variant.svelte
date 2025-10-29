<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { HighlightCardFeed } from '$lib/ndk/blocks';
  import { ReplyAction, ReactionAction, RepostAction } from '$lib/ndk/actions/index.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<HighlightCardFeed {ndk} {event}>
  {#snippet actions()}
    <ReplyAction {ndk} {event} />
    <ReactionAction {ndk} {event} />
    <RepostAction {ndk} {event} />
  {/snippet}
</HighlightCardFeed>
