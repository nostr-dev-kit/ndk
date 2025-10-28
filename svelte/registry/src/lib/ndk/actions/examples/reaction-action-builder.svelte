<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createReactionAction } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const reaction = createReactionAction(() => ({ ndk, event }));
</script>

<div class="demo-event-card">
  <div class="event-content">
    <p>{event.content}</p>
  </div>
  <div class="event-actions builder-examples">
    <button class="custom-reaction-btn" onclick={() => reaction.react("+")}>
      <span class="emoji">❤️</span>
      <span class="count">{reaction.get("+")?.count ?? 0}</span>
    </button>

    <button
      class="custom-reaction-btn"
      class:reacted={reaction.get("🔥")?.hasReacted}
      onclick={() => reaction.react("🔥")}
    >
      <span class="emoji">🔥</span>
      <span class="count">{reaction.get("🔥")?.count ?? 0}</span>
    </button>

    <button
      class="custom-reaction-btn icon-only"
      class:reacted={reaction.get("🚀")?.hasReacted}
      onclick={() => reaction.react("🚀")}
      title={reaction.get("🚀")?.hasReacted ? 'Remove reaction' : 'React with 🚀'}
    >
      🚀
    </button>
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

  .builder-examples {
    gap: 1rem;
  }

  .custom-reaction-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .custom-reaction-btn:hover {
    background: hsl(var(--color-muted));
    border-color: hsl(var(--color-border));
  }

  .custom-reaction-btn.reacted {
    background: hsl(var(--color-primary) / 0.1);
    border-color: hsl(var(--color-primary));
    color: hsl(var(--color-primary));
  }

  .custom-reaction-btn.reacted:hover {
    background: hsl(var(--color-primary) / 0.2);
  }

  .custom-reaction-btn .emoji {
    font-size: 1.125rem;
    line-height: 1;
  }

  .custom-reaction-btn .count {
    font-weight: 500;
    color: hsl(var(--color-muted-foreground));
    min-width: 1rem;
    text-align: center;
  }

  .custom-reaction-btn.reacted .count {
    color: hsl(var(--color-primary));
  }

  .custom-reaction-btn.icon-only {
    padding: 0.5rem;
    font-size: 1.125rem;
    min-width: 2.5rem;
    justify-content: center;
  }
</style>
