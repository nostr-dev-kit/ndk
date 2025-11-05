<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKHighlight } from '@nostr-dev-kit/ndk';
  import EventContent from '$lib/registry/ui/event-content.svelte'; import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
  import HighlightEmbeddedInline from '$lib/registry/components/highlight-embedded/highlight-embedded-inline.svelte';
  import { EventCard } from '$lib/registry/components/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create custom renderer for inline variant
  const inlineRenderer = new ContentRenderer();
  inlineRenderer.addKind(NDKHighlight, HighlightEmbeddedInline);
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" showTimestamp={true} />
    <div class="p-4">
      <EventContent {ndk} {event} renderer={inlineRenderer} />
    </div>
  </EventCard.Root>
</div>
