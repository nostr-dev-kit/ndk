<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventContent, KindRegistry } from '$lib/ndk/event/content';
  import NoteEmbeddedInline from '$lib/ndk/event/content/kinds/note-embedded/note-embedded-inline.svelte';
  import { EventCard } from '$lib/ndk/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create custom registry for inline variant
  const inlineRegistry = new KindRegistry();
  inlineRegistry.add([1, 1111], NoteEmbeddedInline);
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" showTimestamp={true} />
    <div class="p-4">
      <EventContent {ndk} {event} kindRegistry={inlineRegistry} />
    </div>
  </EventCard.Root>
</div>
