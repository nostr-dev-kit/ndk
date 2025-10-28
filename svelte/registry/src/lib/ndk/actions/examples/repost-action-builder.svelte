<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createRepostAction } from '@nostr-dev-kit/svelte';

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
    <button class="custom-btn" class:active={repostState.hasReposted} onclick={repostState.repost}>
      🔄 Repost ({repostState.count})
    </button>
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

  .custom-btn {
    padding: 0.5rem 1rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .custom-btn:hover {
    background: hsl(var(--color-muted));
  }

  .custom-btn.active {
    color: #10b981;
    border-color: #10b981;
  }
</style>
