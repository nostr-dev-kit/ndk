<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext, setContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './event-card.context.js';
  import { CONTENT_RENDERER_CONTEXT_KEY, type ContentRendererContext } from '../../ui/content-renderer/content-renderer.context.js';
  import type {
    UserClickCallback,
    EventClickCallback,
    HashtagClickCallback,
    LinkClickCallback,
    MediaClickCallback
  } from '../../ui/content-renderer/index.svelte.js';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import { cn } from '../../utils/cn';
  import type { Snippet } from 'svelte';

  interface Props {
    ndk?: NDKSvelte;

    event: NDKEvent;

    onclick?: (e: MouseEvent) => void;

    onUserClick?: UserClickCallback;

    onEventClick?: EventClickCallback;

    onHashtagClick?: HashtagClickCallback;

    onLinkClick?: LinkClickCallback;

    onMediaClick?: MediaClickCallback;

    class?: string;

    children?: Snippet;

    [key: string]: any;
  }

  let {
    ndk: providedNdk,
    event,
    onclick,
    onUserClick,
    onEventClick,
    onHashtagClick,
    onLinkClick,
    onMediaClick,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // EventCardContext: structural data about the card
  const context: EventCardContext = {
    get ndk() { return ndk; },
    get event() { return event; },
    get interactive() { return !!onclick; }
  };

  setContext(EVENT_CARD_CONTEXT_KEY, context);

  // Get parent ContentRendererContext if it exists
  const parentRendererContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);

  // ContentRendererContext: includes renderer + behavioral callbacks for entity interactions
  const rendererContext: ContentRendererContext = {
    get renderer() { return parentRendererContext?.renderer ?? {} as any; },
    get onUserClick() { return onUserClick ?? parentRendererContext?.onUserClick; },
    get onEventClick() { return onEventClick ?? parentRendererContext?.onEventClick; },
    get onHashtagClick() { return onHashtagClick ?? parentRendererContext?.onHashtagClick; },
    get onLinkClick() { return onLinkClick ?? parentRendererContext?.onLinkClick; },
    get onMediaClick() { return onMediaClick ?? parentRendererContext?.onMediaClick; }
  };

  setContext(CONTENT_RENDERER_CONTEXT_KEY, rendererContext);

  // Determine if we should show as clickable
  const isClickable = $derived(!!onclick);
</script>

{#if isClickable}
  <button
    data-event-card-root=""
    data-interactive=""
    class={cn(
      'relative flex flex-col gap-2 cursor-pointer w-full text-left bg-transparent border-0 p-0',
      className
    )}
    {onclick}
    type="button"
    {...restProps}
  >
    {#if children}
      {@render children()}
    {/if}
  </button>
{:else}
  <article
    data-event-card-root=""
    class={cn(
      'relative flex flex-col gap-2',
      className
    )}
    {...restProps}
  >
    {#if children}
      {@render children()}
    {/if}
  </article>
{/if}