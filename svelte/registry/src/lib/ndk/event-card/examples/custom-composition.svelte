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

<EventCard.Root {ndk} {event} class="custom-card">
  <div class="custom-layout">
    <EventCard.Header variant="minimal" showTimestamp={false} />
    <EventCard.Content />
    <div class="custom-actions">
      <ReactionAction emoji="🔥" />
      <ReactionAction emoji="💯" />
      <ReactionAction emoji="🚀" />
    </div>
  </div>
</EventCard.Root>

<style>
  :global(.custom-card .custom-layout) {
    padding: 1rem;
  }

  .custom-actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }
</style>
