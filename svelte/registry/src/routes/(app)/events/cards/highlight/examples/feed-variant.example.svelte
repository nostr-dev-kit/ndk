<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import HighlightCardFeed from '$lib/registry/components/highlight-card/highlight-card-feed.svelte';
import RepostButton from '$lib/registry/components/repost/buttons/basic/repost-button.svelte';
  import { ReactionAction } from '$lib/registry/components/reaction';

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
