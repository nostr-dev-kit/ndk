<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '../../utils/cn.js';

  interface Props {
    ndk?: NDKSvelte;
    event: NDKEvent;
    variant?: 'ghost' | 'outline' | 'pill' | 'solid';
    emoji?: string;
    showCount?: boolean;
    delayed?: number;
    onclick?: () => void;
    class?: string;
  }

  let { ndk: ndkProp, event, variant = 'ghost', emoji = '❤️', showCount = true, delayed, onclick, class: className = '' }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;

  const reactionState = createReactionAction(() => ({ event, delayed }), ndk);

  const stats = $derived(reactionState.get(emoji) ?? { count: 0, hasReacted: false, pubkeys: [], emoji });

  // Get total count of all reactions
  const totalCount = $derived(reactionState.totalCount ?? 0);

  async function handleClick() {
    if (onclick) {
      onclick();
    } else {
      if (!ndk?.$currentPubkey) return;
      try {
        await reactionState.react(emoji);
      } catch (error) {
        console.error('Failed to react:', error);
      }
    }
  }
</script>

<button
  onclick={handleClick}
  class={cn(
    'inline-flex items-center gap-2 cursor-pointer transition-all',
    variant === 'ghost' && 'p-2 bg-transparent border-none hover:bg-accent',
    variant === 'outline' && 'px-3 py-2 bg-transparent border border-border rounded-md hover:bg-accent',
    variant === 'pill' && 'px-4 py-2 bg-transparent border border-border rounded-full hover:bg-accent',
    variant === 'solid' && 'px-4 py-2 bg-muted border border-border rounded-md hover:bg-accent',
    stats.hasReacted && 'text-red-500',
    className
  )}
  aria-label={`React with ${emoji} (${totalCount} total reactions)`}
>
  {#if emoji === '❤️'}
    <svg
      class={cn(
        'flex-shrink-0',
        stats.hasReacted && 'animate-[heartbeat_0.3s_ease-in-out]'
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      color="currentColor"
      fill={stats.hasReacted ? 'currentColor' : 'none'}
    >
      <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ></path>
    </svg>
  {:else}
    <span class="text-lg leading-none flex-shrink-0">{emoji}</span>
  {/if}

  {#if showCount && totalCount > 0}
    <span class="text-sm font-medium">{totalCount}</span>
  {/if}
</button>

<style>
  @keyframes heartbeat {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }
</style>
