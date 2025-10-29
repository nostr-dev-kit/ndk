<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import AvatarGroup from '$lib/ndk/user-profile/avatar-group.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const reaction = createReactionAction(() => ({ event }), ndk);
</script>

<div class="demo-event-card">
  <div class="event-content">
    <p>{event.content}</p>
  </div>
  <div class="slack-reactions">
    {#each reaction.all as { emoji, count, hasReacted, pubkeys } (emoji)}
      <button
        class="reaction-pill"
        class:reacted={hasReacted}
        onclick={() => reaction.react(emoji)}
      >
        <span class="emoji">{emoji}</span>
        <span class="count">{count}</span>

        <div class="hover-tooltip w-32">
          <AvatarGroup {ndk} pubkeys={pubkeys.slice(0, 3)} max={3} size={24} spacing="tight" />
        </div>
      </button>
    {/each}
    {#if reaction.all.length === 0}
      <p class="no-reactions">No reactions yet</p>
    {/if}
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

  .slack-reactions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid hsl(var(--color-border));
  }

  .reaction-pill {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    background: hsl(var(--color-card));
    border: 1.5px solid hsl(var(--color-border));
    border-radius: 1rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .reaction-pill:hover {
    background: hsl(var(--color-muted) / 0.5);
    border-color: hsl(var(--color-muted-foreground) / 0.3);
    transform: translateY(-1px);
  }

  .reaction-pill.reacted {
    background: hsl(var(--color-primary) / 0.12);
    border-color: hsl(var(--color-primary) / 0.5);
  }

  .reaction-pill.reacted:hover {
    background: hsl(var(--color-primary) / 0.18);
    border-color: hsl(var(--color-primary) / 0.7);
  }

  .reaction-pill .emoji {
    font-size: 1rem;
    line-height: 1;
  }

  .reaction-pill .count {
    font-weight: 600;
    font-size: 0.8125rem;
    color: hsl(var(--color-muted-foreground));
  }

  .reaction-pill.reacted .count {
    color: hsl(var(--color-primary));
  }

  .hover-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 0.5rem;
    padding: 0.75rem 1rem;
    background: hsl(var(--color-popover));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    white-space: nowrap;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .reaction-pill:hover .hover-tooltip {
    opacity: 1;
  }

  .hover-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: hsl(var(--color-border));
  }

  .tooltip-text {
    font-size: 0.75rem;
    color: hsl(var(--color-muted-foreground));
    font-weight: 500;
  }

  .no-reactions {
    color: hsl(var(--color-muted-foreground));
    text-align: center;
    padding: 1rem;
    font-style: italic;
  }
</style>
