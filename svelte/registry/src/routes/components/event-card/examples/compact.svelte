<script lang="ts">
  import { EventCard, ReactionAction } from '$lib/ndk/event-card';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<EventCard.Root {ndk} {event}>
  <EventCard.Header variant="compact" showDropdown={false} />
  <EventCard.Content truncate={100} />
  <EventCard.Actions>
    <ReactionAction emoji="🤙" />
  </EventCard.Actions>
</EventCard.Root>
