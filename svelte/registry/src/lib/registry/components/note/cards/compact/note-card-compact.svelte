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

<div data-note-card-compact="" class="border border-border rounded-md bg-card p-2 text-sm leading-snug [&_header]:mb-1.5 [&_.font-semibold]:text-[0.8125rem] [&_.text-xs]:text-xs [&_.text-sm]:text-xs">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="compact" avatarSize="sm" showTimestamp={true} />
    <div class="text-[0.8125rem] leading-snug text-muted-foreground [&_p]:m-0">
      <EventCard.Content truncate={2} showMedia={false} showLinkPreview={false} />
    </div>
  </EventCard.Root>
</div>
