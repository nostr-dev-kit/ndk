<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { HighlightCardFeed, RepostButton } from '$lib/ndk/blocks';
  import { ReactionAction } from '$lib/ndk/actions/index.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<HighlightCardFeed {ndk} {event}>
  {#snippet actions()}
    <ReactionAction {ndk} {event} />
    <RepostButton {ndk} {event} />
  {/snippet}
</HighlightCardFeed>
