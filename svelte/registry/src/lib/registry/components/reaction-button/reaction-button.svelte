<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReactionAction } from '../../builders/reaction-action/index.svelte.js';
  import { getContext } from 'svelte';
  import { tv } from 'tailwind-variants';

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

  const buttonStyles = tv({
    base: 'inline-flex items-center gap-2 cursor-pointer font-medium text-sm transition-all rounded-md outline-none disabled:pointer-events-none disabled:opacity-50',
    variants: {
      variant: {
        ghost: 'px-3 py-2 hover:bg-accent hover:text-accent-foreground',
        outline: 'px-3 py-2 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border border-border',
        pill: 'px-4 py-2 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border border-border rounded-full',
        solid: 'px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90'
      },
      active: {
        true: 'text-red-500',
        false: ''
      }
    }
  });

  const iconStyles = tv({
    base: 'flex-shrink-0',
    variants: {
      active: {
        true: 'animate-[heartbeat_0.3s_ease-in-out]',
        false: ''
      }
    }
  });

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
  class={buttonStyles({ variant, active: stats.hasReacted, class: className })}
  aria-label={`React (${displayCount})`}
>
  <svg
    class={iconStyles({ active: stats.hasReacted })}
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
