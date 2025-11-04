<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKHighlight } from '@nostr-dev-kit/ndk';
  import { EventContent, ContentRenderer } from '$lib/registry/ui';
  import HighlightEmbeddedCompact from '$lib/registry/components/highlight-embedded/highlight-embedded-compact.svelte';
  import { EventCard } from '$lib/registry/components/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create custom renderer for compact variant
  const compactRenderer = new ContentRenderer();
  compactRenderer.addKind(NDKHighlight, HighlightEmbeddedCompact);
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" showTimestamp={true} />
    <div class="p-4">
      <EventContent {ndk} {event} renderer={compactRenderer} />
    </div>
  </EventCard.Root>
</div>
