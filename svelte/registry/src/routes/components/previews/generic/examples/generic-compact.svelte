<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventContent } from '$lib/ndk/event/content';
  import { EventCard } from '$lib/ndk/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div class="max-w-2xl">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="compact" showTimestamp={true} />
    <EventCard.Content>
      <EventContent {ndk} {event} />
    </EventCard.Content>
  </EventCard.Root>
</div>
