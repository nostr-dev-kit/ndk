<script lang="ts">
  import { EventCard, ReplyAction, RepostAction, ReactionAction } from '$lib/ndk/event-card';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions>
    <ReplyAction />
    <RepostAction />
    <ReactionAction />
  </EventCard.Actions>
</EventCard.Root>
