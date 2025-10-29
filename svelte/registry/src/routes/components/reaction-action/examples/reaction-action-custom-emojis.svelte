<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import ReactionAction from '$lib/ndk/actions/reaction-action.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<div class="demo-event-card">
  <div class="event-content">
    <p>{event.content}</p>
  </div>
  <div class="event-actions">
    <ReactionAction {ndk} {event} emoji="🔥" />
    <ReactionAction {ndk} {event} emoji="🚀" />
    <ReactionAction {ndk} {event} emoji="👍" />
  </div>
</div>

<style>
  .demo-event-card {
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .event-content {
    margin-bottom: 1rem;
  }

  .event-content p {
    margin: 0;
    color: hsl(var(--color-foreground));
    line-height: 1.6;
  }

  .event-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid hsl(var(--color-border));
  }
</style>
