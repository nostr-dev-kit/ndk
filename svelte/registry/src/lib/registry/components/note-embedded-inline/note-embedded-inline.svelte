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

<div data-note-embedded-inline="" class="note-embedded-inline">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" avatarSize="md" showTimestamp={true} />
    <EventCard.Content truncate={150} />
  </EventCard.Root>
</div>

<style>
  .note-embedded-inline {
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--card);
    padding: 0.75rem;
    max-width: 500px;
  }
</style>
