<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { Snippet } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './event-card.context.js';
  import { CONTENT_RENDERER_CONTEXT_KEY, type ContentRendererContext } from '../../ui/content-renderer/content-renderer.context.js';
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

  const rendererContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);

  // Use onclick prop if provided, otherwise fall back to context callback
  const handleClick = $derived(onclick ?? rendererContext?.onEventClick);
</script>

<Event.ReplyIndicator
  ndk={context.ndk}
  event={context.event}
  class={className}
  onclick={handleClick}
  {children}
/>
