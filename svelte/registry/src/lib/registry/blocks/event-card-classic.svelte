<!-- @ndk-version: event-card-classic@0.1.0 -->
<!--
  @component EventCardClassic
  A classic event card block with complete functionality.
  Features background, dropdown menu, reposts, and reactions.

  @example
  ```svelte
  <EventCardClassic {ndk} {event} />
  <EventCardClassic {ndk} {event} interactive showActions={false} />
  <EventCardClassic {ndk} {event} showDropdown={false} />
  ```
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { type NDKSvelte, type ThreadingMetadata } from '@nostr-dev-kit/svelte';
  import { EventCard, ReactionAction } from '../components/event-card/index.js';
  import RepostButton from './repost-button.svelte';
  import { cn } from '../../utils.js';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The event to display */
    event: NDKEvent;

    /** Threading metadata for thread views */
    threading?: ThreadingMetadata;

    /** Make card clickable to navigate */
    interactive?: boolean;

    /** Show action buttons (repost, reaction) */
    showActions?: boolean;

    /** Show dropdown menu */
    showDropdown?: boolean;

    /** Truncate content */
    truncate?: number;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    event,
    threading,
    interactive = false,
    showActions = true,
    showDropdown = true,
    truncate,
    class: className = ''
  }: Props = $props();
</script>

<EventCard.Root
  {ndk}
  {event}
  {threading}
  {interactive}
  class={cn(
    'p-4 rounded-lg border border-border bg-card',
    'hover:bg-accent/50 transition-colors',
    className
  )}
>
  {#if threading?.showLineToNext}
    <EventCard.ThreadLine />
  {/if}

  <div class="flex items-start justify-between gap-2">
    <EventCard.Header />
    {#if showDropdown}
      <EventCard.Dropdown />
    {/if}
  </div>

  <EventCard.Content {truncate} />

  {#if showActions}
    <EventCard.Actions>
      <RepostButton {ndk} {event} />
      <ReactionAction />
    </EventCard.Actions>
  {/if}
</EventCard.Root>
