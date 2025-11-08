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

<div data-note-card-compact="" class="note-card-compact">
  <EventCard.Root {ndk} {event}>
    <EventCard.Header variant="compact" avatarSize="sm" showTimestamp={true} />
    <div class="compact-content">
      <EventCard.Content truncate={2} showMedia={false} showLinkPreview={false} />
    </div>
  </EventCard.Root>
</div>

<style>
  .note-card-compact {
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--card);
    padding: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .note-card-compact :global(header) {
    margin-bottom: 0.375rem;
  }

  .note-card-compact :global(.font-semibold) {
    font-size: 0.8125rem;
  }

  .note-card-compact :global(.text-xs),
  .note-card-compact :global(.text-sm) {
    font-size: 0.75rem;
  }

  .compact-content {
    font-size: 0.8125rem;
    line-height: 1.4;
    color: var(--muted-foreground);
  }

  .compact-content :global(p) {
    margin: 0;
  }
</style>
