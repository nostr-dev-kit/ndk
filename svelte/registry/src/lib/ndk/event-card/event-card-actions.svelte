<!--
  @component EventCard.Actions
  Container for event action buttons.
  Can use default slot to provide custom actions.

  @example
  ```svelte
  <EventCard.Actions />

  <EventCard.Actions>
    <ReplyAction />
    <RepostAction />
    <ReactionAction />
    <ZapAction />
  </EventCard.Actions>
  ```
-->
<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    /** Display variant */
    variant?: 'default' | 'compact' | 'vertical';

    /** Additional CSS classes */
    class?: string;

    /** Custom action buttons */
    children?: Snippet;
  }

  let {
    variant = 'default',
    class: className = '',
    children
  }: Props = $props();

  // Stop propagation to prevent card navigation
  function stopPropagation(e: Event) {
    e.stopPropagation();
  }
</script>

<div
  class={cn(
    'event-card-actions',
    variant === 'vertical' ? 'flex-col gap-4' : 'flex-row',
    'flex items-center px-4 py-2',
    'border-t',
    className
  )}
  style="border-top-color: #f0f0f0;"
  onclick={stopPropagation}
>
  {#if children}
    {@render children()}
  {:else}
    <!-- Default actions if none provided -->
    <div class="text-muted-foreground text-sm">
      Add action components here
    </div>
  {/if}
</div>

<style>
  .event-card-actions {
    /* Prevent accidental text selection */
    user-select: none;
    display: flex;
    flex-direction: row;
    gap: 3rem;

    /* DEBUG: Visual guide */
    /* outline: 2px solid orange; */
  }

  /* Consistent styling for action buttons */
  .event-card-actions :global(button) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    transition: color 0.2s ease-in-out;
    font-size: 0.8125rem;
    font-weight: 400;
    color: #666;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .event-card-actions :global(button:hover) {
    color: #8b5cf6;
  }

  .event-card-actions :global(button:active) {
    transform: scale(0.98);
  }

  /* Icon sizing */
  .event-card-actions :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  /* Count text - numbers only, font weight 500 */
  .event-card-actions :global(.reply-count),
  .event-card-actions :global(.repost-count),
  .event-card-actions :global(.reaction-count) {
    font-variant-numeric: tabular-nums;
    min-width: 1rem;
    text-align: left;
    font-weight: 500;
  }
</style>