<!--
  @component EventCard.ThreadLine
  Displays vertical thread lines based on threading metadata.
  Used to show thread connections Twitter/X style.

  @example
  ```svelte
  <EventCard.Root {event} {threading}>
    <EventCard.ThreadLine />
    <EventCard.Header />
    <EventCard.Content />
  </EventCard.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './context.svelte.js';
  import { cn } from '$lib/utils';

  interface Props {
    /** Force showing line regardless of threading metadata */
    forceShow?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    forceShow = false,
    class: className = ''
  }: Props = $props();

  const context = getContext<EventCardContext>(EVENT_CARD_CONTEXT_KEY);
  const threading = context?.threading;

  // Determine if we should show the line
  const showLine = $derived(
    forceShow || threading?.showLineToNext
  );

  // Determine line style based on thread type
  const lineClass = $derived.by(() => {
    if (!threading) return 'thread-line';

    return cn(
      'thread-line',
      threading.isSelfThread && 'thread-line--self',
      className
    );
  });

  // Calculate position based on depth
  const leftOffset = $derived(
    threading?.depth
      ? `calc(2rem + ${threading.depth * 1.5}rem)`
      : '2rem'
  );
</script>

{#if showLine}
  <div
    class={lineClass}
    style:left={leftOffset}
    aria-hidden="true"
  />
{/if}

<style>
  .thread-line {
    position: absolute;
    top: 3.5rem; /* Start below avatar */
    bottom: 0;
    width: 2px;
    background: var(--border);
    pointer-events: none;
    z-index: 0;
  }

  /* Self-thread (same author) - different color/style */
  .thread-line--self {
    background: var(--primary);
    opacity: 0.5;
    width: 3px;
  }

  /* Animation for new lines appearing */
  @keyframes lineAppear {
    from {
      transform: scaleY(0);
      transform-origin: top;
    }
    to {
      transform: scaleY(1);
      transform-origin: top;
    }
  }

  .thread-line {
    animation: lineAppear 0.2s ease-out;
  }

  /* Different line styles for missing events */
  :global(.event-card--missing) .thread-line {
    background-image: repeating-linear-gradient(
      to bottom,
      var(--border),
      var(--border) 4px,
      transparent 4px,
      transparent 8px
    );
    width: 2px;
  }
</style>