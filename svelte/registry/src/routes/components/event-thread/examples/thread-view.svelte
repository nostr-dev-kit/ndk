<script lang="ts">
  import { EventCard, ReplyAction, ReactionAction } from '$lib/ndk/event-card';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { ThreadingMetadata } from '$lib/ndk/event-card';

  interface Props {
    ndk: NDKSvelte;
    threadNote: NDKEvent;
    selfThreadNote: NDKEvent;
    threadingMetadata: ThreadingMetadata;
    selfThreadingMetadata: ThreadingMetadata;
  }

  let { ndk, threadNote, selfThreadNote, threadingMetadata, selfThreadingMetadata }: Props = $props();
</script>

<!-- Parent -->
<EventCard.Root {ndk} event={threadNote} threading={threadingMetadata}>
  <EventCard.ThreadLine />
  <EventCard.Header variant="compact" />
  <EventCard.Content />
  <EventCard.Actions>
    <ReplyAction />
    <ReactionAction />
  </EventCard.Actions>
</EventCard.Root>

<!-- Self-thread reply -->
<EventCard.Root {ndk} event={selfThreadNote} threading={selfThreadingMetadata}>
  <EventCard.ThreadLine />
  <EventCard.Header variant="compact" />
  <EventCard.Content />
  <EventCard.Actions>
    <ReactionAction emoji="❤️" />
  </EventCard.Actions>
</EventCard.Root>
