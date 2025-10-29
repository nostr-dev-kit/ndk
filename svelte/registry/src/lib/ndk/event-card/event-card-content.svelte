<!-- @ndk-version: event-card@0.0.0 -->
<!--
  @component EventCard.Content
  Displays event content using EventContent from @nostr-dev-kit/svelte.
  Automatically handles different event kinds appropriately.

  @example
  ```svelte
  <EventCard.Content />
  <EventCard.Content truncate={3} />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import EventContent from '$lib/ndk/event/content/event-content.svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './context.svelte.js';
  import { cn } from '$lib/utils';

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

<div class="event-card-content-wrapper">
  <div
    bind:this={contentElement}
    class={cn(
      'event-card-content',
      'text-[15px] text-foreground',
      'whitespace-pre-wrap break-words',
      truncate && !expanded && 'truncated',
      className
    )}
    style={truncate && !expanded ? `--line-clamp: ${truncate}; --line-height: 1.5;` : undefined}
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
      class="read-more-button"
      type="button"
    >
      {expanded ? 'Show less' : 'Read more'}
    </button>
  {/if}
</div>

<style>
  .event-card-content-wrapper {
    position: relative;
  }

  .event-card-content {
    /* Prevent huge content from breaking layout */
    word-break: break-word;
    overflow-wrap: break-word;
    line-height: var(--line-height, 1.5);
  }

  .event-card-content.truncated {
    max-height: calc(var(--line-clamp, 3) * var(--line-height, 1.5) * 1em);
    overflow: hidden;
    position: relative;
  }

  .event-card-content.truncated::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 1.5em;
    background: linear-gradient(to bottom, transparent, var(--background));
    pointer-events: none;
  }

  .read-more-button {
    margin-top: 0.5rem;
    color: var(--primary);
    font-size: 0.875rem;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: opacity 0.2s;
  }

  .read-more-button:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  /* Custom styles for EventContent children */
  .event-card-content :global(.mention) {
    color: var(--primary) !important;
    font-weight: 500;
  }

  .event-card-content :global(.hashtag) {
    color: var(--primary);
  }

  .event-card-content :global(a) {
    color: var(--primary);
    text-decoration: none;
  }

  .event-card-content :global(a:hover) {
    text-decoration: underline;
  }

  .event-card-content :global(img),
  .event-card-content :global(video) {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin-top: 0.5rem;
  }

  .event-card-content :global(pre) {
    background: var(--muted);
    padding: 0.75rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    margin: 0.5rem 0;
  }

  .event-card-content :global(code) {
    background: var(--muted);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }

  .event-card-content :global(pre code) {
    background: none;
    padding: 0;
  }
</style>