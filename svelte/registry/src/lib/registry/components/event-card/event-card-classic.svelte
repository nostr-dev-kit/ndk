<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from './index.js';
  import { ReactionAction } from '../reaction/index.js';
  import RepostButton from '../actions/repost-button.svelte';
  import { cn } from '../../utils/cn.js';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The event to display */
    event: NDKEvent;

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
  class={cn(
    'p-4 rounded-lg border border-border bg-card',
    'hover:bg-accent/50 transition-colors',
    className
  )}
>
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
