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
  <div class="flex items-center justify-between p-4 border-b" style="border-bottom-color: #f0f0f0;">
    <div class="flex items-center gap-3 flex-1">
      <EventCard.Header showMenu={false} class="!p-0 !border-0" />
    </div>
    <EventCard.Dropdown />
  </div>
  <EventCard.Content />
  <EventCard.Actions>
    <ReplyAction />
    <RepostAction />
    <ReactionAction />
  </EventCard.Actions>
</EventCard.Root>
