<script lang="ts">
  import type { NDKSvelte, NDKEvent } from '@nostr-dev-kit/svelte';
  import { HighlightCard } from '../index.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<HighlightCard.Grid {ndk} {event} />
