<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import EventContent from '$lib/registry/ui/event-rendering.svelte'; import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
  import NoteEmbedded from '$lib/registry/components/note/cards/compact/note-card-compact.svelte';
  import { EventCard } from '$lib/registry/components/event/cards/compound';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create custom renderer for compact variant
  const compactRenderer = new ContentRenderer();
  compactRenderer.addKind([1, 1111], NoteEmbedded);
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" showTimestamp={true} />
    <div class="p-4">
      <EventContent {ndk} {event} renderer={compactRenderer} />
    </div>
  </EventCard.Root>
</div>
