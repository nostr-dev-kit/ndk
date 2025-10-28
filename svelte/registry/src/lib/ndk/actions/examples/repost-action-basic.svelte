<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createRepostAction } from '@nostr-dev-kit/svelte';
  import RepostAction from '$lib/ndk/actions/repost-action.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const repostState = createRepostAction(() => ({ ndk, event }));
</script>

<div class="demo-event-card">
  <div class="event-content">
    <p>{event.content}</p>
  </div>
  <div class="event-actions">
    <RepostAction {ndk} {event} />
    <div class="count-display">
      {repostState.count} repost{repostState.count === 1 ? '' : 's'}
    </div>
  </div>
</div>

<style>
  .demo-event-card {
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.75rem;
    padding: 1.5rem;
  }

  .event-content {
    margin-bottom: 1rem;
  }

  .event-content p {
    margin: 0;
    line-height: 1.6;
    color: hsl(var(--color-foreground));
  }

  .event-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid hsl(var(--color-border));
  }

  .count-display {
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--color-muted-foreground));
    padding: 0.5rem 0.75rem;
    background: hsl(var(--color-muted) / 0.5);
    border-radius: 0.375rem;
  }
</style>
