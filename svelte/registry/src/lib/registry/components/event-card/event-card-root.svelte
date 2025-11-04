<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { setContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './event-card.context.js';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import { cn } from '../../utils/cn.js';
  import type { Snippet } from 'svelte';

  interface Props {
    /** NDK instance (optional, falls back to context) */
    ndk?: NDKSvelte;

    /** The event to display (any kind) */
    event: NDKEvent;

    /** Click handler (if provided, card becomes interactive) */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;

    /** Child components */
    children?: Snippet;
  }

  let {
    ndk: providedNdk,
    event,
    onclick,
    class: className = '',
    children
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
    class={cn(
      'relative flex flex-col gap-2 cursor-pointer w-full text-left bg-transparent border-none p-0',
      className
    )}
    {onclick}
    type="button"
  >
    {#if children}
      {@render children()}
    {/if}
  </button>
{:else}
  <article
    class={cn(
      'relative flex flex-col gap-2',
      className
    )}
  >
    {#if children}
      {@render children()}
    {/if}
  </article>
{/if}