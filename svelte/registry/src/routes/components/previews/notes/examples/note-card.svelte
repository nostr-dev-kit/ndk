<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventContent, KindRegistry } from '$lib/registry/components/event/content';
  import NoteEmbeddedCard from '$lib/registry/components/event/content/kinds/note-embedded/note-embedded-card.svelte';
  import { EventCard } from '$lib/registry/components/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create custom registry for card variant
  const cardRegistry = new KindRegistry();
  cardRegistry.add([1, 1111], NoteEmbeddedCard);
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" showTimestamp={true} />
    <div class="p-4">
      <EventContent {ndk} {event} kindRegistry={cardRegistry} />
    </div>
  </EventCard.Root>
</div>
