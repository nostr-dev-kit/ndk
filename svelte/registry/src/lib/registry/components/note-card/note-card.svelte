<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '../event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div data-note-card="" class="note-card">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="compact" avatarSize="sm" showTimestamp={true} />
    <EventCard.Content truncate={200} class="text-sm text-muted-foreground" />
  </EventCard.Root>
</div>

<style>
  .note-card {
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1rem;
    overflow: hidden;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }

  .note-card :global(article) {
    gap: 0.75rem;
  }
</style>
