<!-- @ndk-version: event-card@0.20.0 -->
<!--
  @component EventCard.Content
  Minimal content display builder with optional truncation.
  For styled content, create custom blocks.

  @example
  ```svelte
  <EventCard.Content />
  <EventCard.Content truncate={3} />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import EventContent from '../event/content/event-content.svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './context.svelte.js';
  import { cn } from '../../../utils.js';

  interface Props {
    /** Maximum number of lines to display before truncating (uses CSS line-clamp) */
    truncate?: number;

    /** Whether to show media attachments */
    showMedia?: boolean;

    /** Whether to show link previews */
    showLinkPreview?: boolean;

    /** Whether to highlight mentions */
    highlightMentions?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    truncate,
    showMedia = true,
    showLinkPreview = true,
    highlightMentions = true,
    class: className = ''
  }: Props = $props();

  const context = getContext<EventCardContext>(EVENT_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('EventCard.Content must be used within EventCard.Root');
  }

  let contentElement: HTMLDivElement | undefined = $state();
  let expanded = $state(false);
  let isOverflowing = $state(false);

  $effect(() => {
    if (!truncate || !contentElement) {
      isOverflowing = false;
      return;
    }

    // Check if content is overflowing
    const checkOverflow = () => {
      if (contentElement && !expanded) {
        // Add a small threshold to avoid false positives from rounding
        isOverflowing = contentElement.scrollHeight > contentElement.clientHeight + 1;
      }
    };

    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        checkOverflow();
      });
    });

    // Recheck on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  });

  const toggleExpanded = () => {
    expanded = !expanded;
  };
</script>

<div class="relative">
  <div
    bind:this={contentElement}
    class={cn(
      'whitespace-pre-wrap break-words',
      truncate && !expanded ? `line-clamp-${truncate}` : undefined,
      className
    )}
  >
    {#key context.event.id}
      <EventContent
        ndk={context.ndk}
        event={context.event}
        {showMedia}
        {showLinkPreview}
        {highlightMentions}
      />
    {/key}
  </div>

  {#if truncate && (isOverflowing || expanded)}
    <button
      onclick={toggleExpanded}
      class="mt-2 text-sm cursor-pointer bg-transparent border-none p-0"
      type="button"
    >
      {expanded ? 'Show less' : 'Read more'}
    </button>
  {/if}
</div>