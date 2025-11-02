<!-- @ndk-version: note-embedded@0.1.0 -->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '../../../../event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    variant?: 'inline' | 'card' | 'compact';
  }

  let { ndk, event, variant = 'card' }: Props = $props();
</script>

<div class="note-embedded" data-variant={variant}>
  <EventCard.Root {ndk} {event}>
    <EventCard.Header
      variant={variant === 'compact' ? 'compact' : 'full'}
      avatarSize={variant === 'compact' ? 'sm' : 'md'}
      showTimestamp={true}
    />

    <EventCard.Content
      truncate={variant === 'compact' ? 100 : variant === 'inline' ? 150 : 200}
    />
  </EventCard.Root>
</div>

<style>
  .note-embedded {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-card);
    padding: 0.75rem;
  }

  [data-variant='compact'] {
    padding: 0.5rem;
  }

  [data-variant='inline'] {
    max-width: 500px;
  }
</style>
