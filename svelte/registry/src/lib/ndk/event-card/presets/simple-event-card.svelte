<!--
  @component SimpleEventCard
  A pre-composed event card with standard layout.
  Good default for most use cases.

  @example
  ```svelte
  <SimpleEventCard {ndk} {event} />
  <SimpleEventCard {ndk} {event} interactive showActions={false} />
  ```
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { type NDKSvelte, type ThreadingMetadata } from '@nostr-dev-kit/svelte';
  import { EventCard, ReplyAction, RepostAction, ReactionAction } from '../index.js';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The event to display */
    event: NDKEvent;

    /** Threading metadata for thread views */
    threading?: ThreadingMetadata;

    /** Make card clickable to navigate */
    interactive?: boolean;

    /** Show action buttons */
    showActions?: boolean;

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
    truncate,
    class: className = ''
  }: Props = $props();
</script>

<EventCard.Root {ndk} {event} {threading} {interactive} class={className}>
  {#if threading?.showLineToNext}
    <EventCard.ThreadLine />
  {/if}

  <EventCard.Header />

  <EventCard.Content {truncate} />

  {#if showActions}
    <EventCard.Actions>
      <ReplyAction />
      <RepostAction />
      <ReactionAction />
    </EventCard.Actions>
  {/if}
</EventCard.Root>