<!-- @ndk-version: reaction-button@0.1.0 -->
<!--
  @component ReactionButton
  Minimal reaction button block using createReactionAction builder.
  Clean, icon-first design with optional count display.

  @example
  ```svelte
  <ReactionButton {ndk} {event} />
  <ReactionButton {ndk} {event} emoji="🔥" />
  <ReactionButton {ndk} {event} showCount={false} />
  <ReactionButton {ndk} {event} delayed={5} />
  ```
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '../../utils/index.js';

  interface Props {
    ndk?: NDKSvelte;
    event: NDKEvent;
    emoji?: string;
    showCount?: boolean;
    delayed?: number;
    class?: string;
  }

  let { ndk: ndkProp, event, emoji = '❤️', showCount = true, delayed, class: className = '' }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;

  const reactionState = createReactionAction(() => ({ event, delayed }), ndk);

  const stats = $derived(reactionState.get(emoji) ?? { count: 0, hasReacted: false, pubkeys: [], emoji });

  async function handleReact() {
    if (!ndk?.$currentPubkey) return;
    try {
      await reactionState.react(emoji);
    } catch (error) {
      console.error('Failed to react:', error);
    }
  }
</script>

<button
  onclick={handleReact}
  class={cn(
    'inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-colors',
    stats.hasReacted && 'text-red-500',
    className
  )}
  aria-label={`React with ${emoji} (${stats.count})`}
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
      <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  {:else}
    <span class="text-lg leading-none flex-shrink-0">{emoji}</span>
  {/if}

  {#if showCount && stats.count > 0}
    <span class="text-sm font-medium">{stats.count}</span>
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
