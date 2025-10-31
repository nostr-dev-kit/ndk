<!-- @ndk-version: event-card@0.20.0 -->
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
  import { cn } from '../../../utils.js';

  interface Props {
    /** Force showing line regardless of threading metadata */
    forceShow?: boolean;

    /** Avatar size (must match Header's avatarSize) - used to calculate line position */
    avatarSize?: 'sm' | 'md' | 'lg';

    /** Additional CSS classes */
    class?: string;
  }

  let {
    forceShow = false,
    avatarSize = 'md',
    class: className = ''
  }: Props = $props();

  const context = getContext<EventCardContext>(EVENT_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('EventCard.ThreadLine must be used within EventCard.Root');
  }

  // Determine if we should show the line
  // Read directly from context.threading to maintain reactivity
  const showLine = $derived(
    forceShow || context?.threading?.showLineToNext
  );

  // Determine line style based on thread type
  const lineClass = $derived.by(() => {
    if (!context?.threading) return 'thread-line';

    return cn(
      'thread-line',
      context.threading.isSelfThread && 'thread-line--self',
      className
    );
  });

  // Calculate avatar center position based on size
  // Avatar sizes: sm=32px, md=40px, lg=48px
  // Position = avatar center (half of avatar width)
  const avatarCenter = $derived(
    avatarSize === 'sm' ? 16 : avatarSize === 'lg' ? 24 : 20
  );

  // Line position: avatar center (no additional offset since Header has !p-0)
  const leftOffset = $derived(`${avatarCenter}px`);
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
    top: 48px; /* Start below avatar (40px height + 8px margin) */
    bottom: 0;
    width: 2px;
    background: var(--color-border);
    pointer-events: none;
    z-index: 0;
  }

  /* Self-thread (same author) - different color/style */
  .thread-line--self {
    background: var(--color-border);
    width: 2px;
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
      var(--color-border),
      var(--color-border) 4px,
      transparent 4px,
      transparent 8px
    );
    width: 2px;
  }
</style>