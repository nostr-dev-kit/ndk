<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { HighlightCard } from '../index.js';
  import { ReplyAction, ReactionAction, RepostAction } from '../../actions/index.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<HighlightCard.Feed {ndk} {event}>
  {#snippet actions()}
    <ReplyAction {ndk} {event} />
    <ReactionAction {ndk} {event} />
    <RepostAction {ndk} {event} />
  {/snippet}
</HighlightCard.Feed>
