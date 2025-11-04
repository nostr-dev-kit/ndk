<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventContent, ContentRenderer } from '$lib/registry/ui';
  import NoteEmbedded from '$lib/registry/components/note-embedded/note-embedded-card.svelte';
  import { EventCard } from '$lib/registry/components/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create custom renderer for card variant
  const cardRenderer = new ContentRenderer();
  cardRenderer.addKind([1, 1111], NoteEmbeddedCard);
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" showTimestamp={true} />
    <div class="p-4">
      <EventContent {ndk} {event} renderer={cardRenderer} />
    </div>
  </EventCard.Root>
</div>
