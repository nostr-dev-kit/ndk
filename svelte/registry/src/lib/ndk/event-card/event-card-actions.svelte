<!-- @ndk-version: event-card@0.15.0 -->
<!--
  @component EventCard.Actions
  Minimal container for action buttons with layout only.

  @example
  ```svelte
  <EventCard.Actions>
    <ReplyAction />
    <RepostButton {ndk} {event} />
    <ReactionAction />
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
    'flex items-center gap-12 select-none',
    variant === 'vertical' && 'flex-col gap-4',
    className
  )}
  onclick={stopPropagation}
>
  {#if children}
    {@render children()}
  {/if}
</div>