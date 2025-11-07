<script lang="ts">
  import { getContext } from 'svelte';
  import EventContent from '../../ui/event-content.svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './event-card.context.js';
  import { CONTENT_RENDERER_CONTEXT_KEY, type ContentRendererContext } from '../../ui/content-renderer.context.js';
  import { cn } from '../../utils/cn.js';

  interface Props {
    truncate?: number;

    showMedia?: boolean;

    showLinkPreview?: boolean;

    highlightMentions?: boolean;

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

  // Get renderer from context if available
  const rendererContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);

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

<div data-event-card-content="" class="relative">
  <div
    bind:this={contentElement}
    class={cn(
      'whitespace-pre-wrap wrap-break-words',
      truncate && !expanded ? `line-clamp-${truncate}` : undefined,
      className
    )}
  >
    {#key context.event.id}
      <EventContent
        ndk={context.ndk}
        event={context.event}
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