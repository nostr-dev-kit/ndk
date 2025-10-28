<!--
  @component EventCard.Content
  Displays event content using EventContent from @nostr-dev-kit/svelte.
  Automatically handles different event kinds appropriately.

  @example
  ```svelte
  <EventCard.Content />
  <EventCard.Content truncate={280} />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import EventContent from '$lib/ndk/event/content/event-content.svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './context.svelte.js';
  import { cn } from '$lib/utils';

  interface Props {
    /** Maximum characters to display (truncates with ellipsis) */
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

  const { ndk, event } = getContext<EventCardContext>(EVENT_CARD_CONTEXT_KEY);

  // Truncate content if needed
  const displayContent = $derived.by(() => {
    if (!truncate || !event.content) return event.content;

    if (event.content.length <= truncate) return event.content;

    // Find a good break point (word boundary)
    let truncateAt = truncate;
    const lastSpace = event.content.lastIndexOf(' ', truncate);
    if (lastSpace > truncate * 0.8) {
      truncateAt = lastSpace;
    }

    return event.content.slice(0, truncateAt) + '...';
  });
</script>

<div
  class={cn(
    'event-card-content',
    'p-4',
    'text-[15px] text-foreground',
    'whitespace-pre-wrap break-words',
    className
  )}
>
  {#if truncate && displayContent !== event.content}
    <!-- Show truncated content as plain text when truncating -->
    <div class="event-content-truncated">
      {displayContent}
    </div>
  {:else}
    <!-- Use EventContent for full rendering -->
    {#key event.id}
      <EventContent
        {ndk}
        {event}
        {showMedia}
        {showLinkPreview}
        {highlightMentions}
      />
    {/key}
  {/if}
</div>

<style>
  .event-card-content {
    /* Prevent huge content from breaking layout */
    word-break: break-word;
    overflow-wrap: break-word;
    line-height: 1.5;
  }

  .event-content-truncated {
    /* Simple text display for truncated content */
    white-space: pre-wrap;
  }

  /* Custom styles for EventContent children */
  .event-card-content :global(.mention) {
    color: #8b5cf6 !important;
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