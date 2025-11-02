<script lang="ts">
  import { EventCard, ReactionAction } from '$lib/registry/components/event-card';
  import RepostButton from '$lib/registry/components/actions/repost-button.svelte';
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
    <RepostButton {ndk} {event} />
    <ReactionAction />
  </EventCard.Actions>
</EventCard.Root>
