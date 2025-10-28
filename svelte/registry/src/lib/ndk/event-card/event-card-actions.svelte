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
    'flex items-center py-2',
    'border-t',
    className
  )}
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
  }
</style>