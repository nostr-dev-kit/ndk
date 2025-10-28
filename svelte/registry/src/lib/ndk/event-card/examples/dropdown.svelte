<script lang="ts">
  import { EventCard, ReplyAction, ReactionAction } from '$lib/ndk/event-card';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<EventCard.Root {ndk} {event}>
  <div class="header-with-dropdown">
    <EventCard.Header showMenu={false} />
    <EventCard.Dropdown />
  </div>
  <EventCard.Content />
  <EventCard.Actions>
    <ReplyAction />
    <ReactionAction />
  </EventCard.Actions>
</EventCard.Root>

<style>
  .header-with-dropdown {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
