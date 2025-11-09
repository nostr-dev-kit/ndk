<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReactionAction } from '../../../../builders/reaction-action.svelte.js';
  import { getContext } from 'svelte';
  import { cn } from '../../../../utils/cn';

  interface Props {
    ndk?: NDKSvelte;
    event: NDKEvent;
    variant?: 'ghost' | 'outline' | 'pill' | 'solid';
    emoji?: string;
    showCount?: boolean;
    countMode?: 'total' | 'emoji';
    onclick?: () => void;
    class?: string;
  }

  let { ndk: ndkProp, event, variant = 'ghost', emoji = '❤️', showCount = true, countMode = 'total', onclick, class: className = '' }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;

  const reactionState = createReactionAction(() => ({ event }), ndk);
  const stats = $derived(reactionState?.get(emoji) ?? { count: 0, hasReacted: false, pubkeys: [], emoji });
  const displayCount = $derived(countMode === 'total' ? reactionState.totalCount : stats.count);

  function handleClick() {
    reactionState.react(emoji);
    onclick?.();
  }
</script>

<button
  data-reaction-button=""
  data-reacted={stats.hasReacted ? '' : undefined}
  data-variant={variant}
  onclick={handleClick}
  class={cn(
    'inline-flex items-center gap-2 cursor-pointer transition-all',
    variant === 'ghost' && 'p-2 bg-transparent border-none hover:bg-accent',
    variant === 'outline' && 'px-3 py-2 bg-transparent border border-border rounded-md hover:bg-accent',
    variant === 'pill' && 'px-4 py-2 bg-transparent border border-border rounded-full hover:bg-accent',
    variant === 'solid' && 'px-4 py-2 bg-muted border border-border rounded-md hover:bg-accent',
    stats.hasReacted && 'text-primary',
    className
  )}
  aria-label={`React (${displayCount})`}
>
  <svg
    class={cn(
      'flex-shrink-0',
      stats.hasReacted && 'animate-[heartbeat_0.3s_ease-in-out]'
    )}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    color="currentColor"
    fill={stats.hasReacted ? 'currentColor' : 'none'}
  >
    <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ></path>
  </svg>
  {#if showCount && displayCount > 0}
    <span class="text-sm font-medium">{displayCount}</span>
  {/if}
</button>
