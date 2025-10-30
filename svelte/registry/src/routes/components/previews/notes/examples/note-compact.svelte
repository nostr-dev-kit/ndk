<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventContent, KindRegistry } from '$lib/ndk/event/content';
  import NoteEmbeddedCompact from '$lib/ndk/event/content/kinds/note-embedded/note-embedded-compact.svelte';
  import { EventCard } from '$lib/ndk/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create custom registry for compact variant
  const compactRegistry = new KindRegistry();
  compactRegistry.add([1, 1111], NoteEmbeddedCompact);
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" showTimestamp={true} />
    <div class="p-4">
      <EventContent {ndk} {event} kindRegistry={compactRegistry} />
    </div>
  </EventCard.Root>
</div>
