<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    content: string;
    count: number;
  }

  let { ndk, event, content, count }: Props = $props();
</script>

<div class="demo-event-card">
  <div class="event-content">
    <p>{content}</p>
  </div>
  <div class="event-actions">
    <button class="custom-reply-btn">
      💬 Reply ({count})
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

  .custom-reply-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .custom-reply-btn:hover {
    background: hsl(var(--color-muted));
  }
</style>
