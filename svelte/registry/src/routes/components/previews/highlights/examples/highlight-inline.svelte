<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKHighlight } from '@nostr-dev-kit/ndk';
  import { EventContent, KindRegistry } from '$lib/registry/components/event/content';
  import HighlightEmbeddedInline from '$lib/registry/components/event/content/kinds/highlight-embedded/highlight-embedded-inline.svelte';
  import { EventCard } from '$lib/registry/components/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create custom registry for inline variant
  const inlineRegistry = new KindRegistry();
  inlineRegistry.add(NDKHighlight, HighlightEmbeddedInline);
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" showTimestamp={true} />
    <div class="p-4">
      <EventContent {ndk} {event} kindRegistry={inlineRegistry} />
    </div>
  </EventCard.Root>
</div>
