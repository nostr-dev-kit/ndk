<!-- @ndk-version: generic-embedded@0.1.0 -->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '$lib/ndk/event-card';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    variant?: 'inline' | 'card' | 'compact';
  }

  let { ndk, event, variant = 'card' }: Props = $props();
</script>

<div class="generic-embedded" data-variant={variant}>
  <EventCard.Root {ndk} {event}>
    <EventCard.Header
      variant={variant === 'compact' ? 'compact' : 'full'}
      avatarSize={variant === 'compact' ? 'sm' : 'md'}
      showTimestamp={true}
    />
    <EventCard.Content
      truncate={variant === 'compact' ? 100 : 200}
    />
  </EventCard.Root>

  <div class="kind-badge">
    Kind {event.kind}
  </div>
</div>

<style>
  .generic-embedded {
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--card);
    padding: 0.75rem;
  }

  .kind-badge {
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    background: var(--muted);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
    display: inline-block;
  }
</style>
