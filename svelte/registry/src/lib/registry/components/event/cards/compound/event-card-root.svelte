<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { setContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './event-card.context.js';
  import { getNDKFromContext } from '../../../utils/ndk-context.svelte.js';
  import { cn } from '../../../utils/cn';
  import type { Snippet } from 'svelte';

  interface Props {
    ndk?: NDKSvelte;

    event: NDKEvent;

    onclick?: (e: MouseEvent) => void;

    class?: string;

    children?: Snippet;

    [key: string]: any;
  }

  let {
    ndk: providedNdk,
    event,
    onclick,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // Create a reactive context object that updates when props change
  const context: EventCardContext = {
    get ndk() { return ndk; },
    get event() { return event; },
    get interactive() { return !!onclick; }
  };

  setContext(EVENT_CARD_CONTEXT_KEY, context);

  // Determine if we should show as clickable
  const isClickable = $derived(!!onclick);
</script>

{#if isClickable}
  <button
    data-event-card-root=""
    data-interactive=""
    class={cn(
      'relative flex flex-col gap-2 cursor-pointer w-full text-left bg-transparent border-none p-0',
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