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
  <div class="p-4">
    <EventCard.Header variant="minimal" showTimestamp={false} />
    <EventCard.Content />
    <div class="flex gap-2 px-4 py-3">
      <ReactionAction emoji="🔥" />
      <ReactionAction emoji="💯" />
      <ReactionAction emoji="🚀" />
    </div>
  </div>
</EventCard.Root>
