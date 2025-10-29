<!-- @ndk-version: event-card@0.14.0 -->
<!--
  @component EventCard.Root
  Root container that provides context to child components.
  Works with any NDKEvent type.

  @example
  ```svelte
  <EventCard.Root {ndk} {event}>
    <EventCard.Header />
    <EventCard.Content />
    <EventCard.Actions />
  </EventCard.Root>
  ```
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { type NDKSvelte, type ThreadingMetadata } from '@nostr-dev-kit/svelte';
  import { setContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './context.svelte.js';
  import { getNDKFromContext } from '../ndk-context.svelte.js';
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    /** NDK instance (optional, falls back to context) */
    ndk?: NDKSvelte;

    /** The event to display (any kind) */
    event: NDKEvent;

    /** Threading metadata for UI rendering */
    threading?: ThreadingMetadata;

    /** Whether clicking the card navigates to event page */
    interactive?: boolean;

    /** Additional CSS classes */
    class?: string;

    /** Child components */
    children?: Snippet;
  }

  let {
    ndk: providedNdk,
    event,
    threading,
    interactive = false,
    class: className = '',
    children
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // Create a reactive context object that updates when props change
  const context: EventCardContext = {
    get ndk() { return ndk; },
    get event() { return event; },
    get threading() { return threading; },
    get interactive() { return interactive; }
  };

  setContext(EVENT_CARD_CONTEXT_KEY, context);

  // Handle click navigation
  function handleClick() {
    if (!interactive) return;

    // Encode as nevent and navigate
    const nevent = event.encode();
    window.location.href = `/e/${nevent}`;
  }

  // Determine if we should show as clickable
  const isClickable = $derived(interactive);
</script>

<article
  class={cn(
    'event-card',
    'p-4',
    'relative',
    'rounded-xl',
    'bg-background',
    'overflow-hidden',
    isClickable && 'cursor-pointer transition-all',
    className
  )}
  onclick={isClickable ? handleClick : undefined}
  role={isClickable ? 'button' : undefined}
  tabindex={isClickable ? 0 : undefined}
  onkeydown={isClickable ? (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  } : undefined}
>
  {#if children}
    {@render children()}
  {/if}
</article>

<style>
  .event-card {
    /* Modern card shadow */
    box-shadow: 0 1px 3px color-mix(in srgb, var(--foreground) 12%, transparent), 0 1px 2px color-mix(in srgb, var(--foreground) 8%, transparent);
    background: var(--background) !important;
  }

  .event-card:hover {
    box-shadow: 0 4px 6px color-mix(in srgb, var(--foreground) 12%, transparent), 0 2px 4px color-mix(in srgb, var(--foreground) 8%, transparent);
  }
</style>