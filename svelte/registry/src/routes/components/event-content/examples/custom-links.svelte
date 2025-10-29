<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import EventContent from '$lib/ndk/event/content/event-content.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<EventContent {ndk} {event}>
  {#snippet link({ url })}
    <a href={url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-violet-600 no-underline font-medium hover:underline">
      🔗 {url}
    </a>
  {/snippet}
</EventContent>
