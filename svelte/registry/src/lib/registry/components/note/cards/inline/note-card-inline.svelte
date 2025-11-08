<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '$lib/registry/components/event/cards/compound';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div data-note-card-inline="" class="border border-border rounded-lg bg-card p-3 max-w-[500px]">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="full" avatarSize="md" showTimestamp={true} />
    <EventCard.Content truncate={150} />
  </EventCard.Root>
</div>
