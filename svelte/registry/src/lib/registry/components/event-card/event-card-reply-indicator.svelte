<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { Snippet } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './event-card.context.js';
  import { Event } from '../../ui/event';

  interface Props {
    class?: string;

    onclick?: (event: NDKEvent) => void;

    children?: Snippet<[{ event: NDKEvent | null; loading: boolean }]>;
  }

  let {
    class: className = '',
    onclick,
    children
  }: Props = $props();

  const context = getContext<EventCardContext>(EVENT_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('EventCard.ReplyIndicator must be used within EventCard.Root');
  }
</script>

<Event.ReplyIndicator
  ndk={context.ndk}
  event={context.event}
  class={className}
  {onclick}
  {children}
/>
