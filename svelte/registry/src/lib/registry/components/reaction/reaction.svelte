<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '../../utils/cn.js';
  import { Popover } from 'bits-ui';
  import { EmojiPicker, type EmojiData } from '../emoji-picker';

  interface Props {
    /** NDKSvelte instance (optional if used in EventCard) */
    ndk?: NDKSvelte;

    /** Event to react to (optional if used in EventCard) */
    event?: NDKEvent;

    /** Default emoji to show */
    emoji?: string;

    /** Whether to show reaction count */
    showCount?: boolean;

    /** Long press duration in ms */
    longPressDuration?: number;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk: ndkProp,
    event: eventProp,
    emoji = '❤️',
    showCount = true,
    longPressDuration = 500,
    class: className = ''
  }: Props = $props();

  // Try to get from EventCard context if not provided as props
  const EVENT_CARD_CONTEXT_KEY = Symbol.for('event-card');
  const ctx = getContext<any>(EVENT_CARD_CONTEXT_KEY);
  let ndk = $derived(ndkProp || ctx?.ndk);
  let event = $derived(eventProp || ctx?.event);

  // Use the builder for reactive state
  const reaction = $derived.by(() => {
    if (!ndk) return null;
    return createReactionAction(() => ({ event }), ndk);
  });

  // Get stats for the default emoji
  const stats = $derived(reaction?.get(emoji) ?? { count: 0, hasReacted: false, pubkeys: [], emoji });

  let showPicker = $state(false);
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let isLongPress = $state(false);

  function handlePointerDown() {
    isLongPress = false;
    longPressTimer = setTimeout(() => {
      isLongPress = true;
      showPicker = true;
    }, longPressDuration);
  }

  function handlePointerUp() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    // Only react if it wasn't a long press
    if (!isLongPress) {
      handleQuickReact();
    }
  }

  function handlePointerCancel() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    isLongPress = false;
  }

  async function handleQuickReact() {
    if (!ndk?.$currentPubkey || !reaction) {
      return;
    }

    try {
      await reaction.react(emoji);
    } catch (error) {
      console.error('Failed to react:', error);
    }
  }

  async function handleEmojiSelect(emojiData: EmojiData) {
    if (!ndk?.$currentPubkey || !reaction) {
      return;
    }

    try {
      await reaction.react(emojiData);
    } catch (error) {
      console.error('Failed to publish reaction:', error);
    }
  }
</script>

<Popover.Root bind:open={showPicker}>
  <Popover.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        class={cn(
          'inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-all duration-200 select-none touch-manipulation',
          stats.hasReacted && 'text-red-500',
          className
        )}
        onpointerdown={handlePointerDown}
        onpointerup={handlePointerUp}
        onpointercancel={handlePointerCancel}
        onpointerleave={handlePointerCancel}
        aria-label={`React with ${emoji}`}
        title="Click to react, long-press for more emojis"
      >
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

        {#if showCount && stats.count > 0}
          <span class="text-sm font-medium min-w-4 text-center">{stats.count}</span>
        {/if}
      </button>
    {/snippet}
  </Popover.Trigger>

  {#if ndk}
    <Popover.Content
      class="z-50 w-80 rounded-lg border bg-card p-4 shadow-md outline-none"
      sideOffset={8}
    >
      <EmojiPicker.Content
        {ndk}
        onSelect={(emojiData) => {
          handleEmojiSelect(emojiData);
          showPicker = false;
        }}
      />
    </Popover.Content>
  {/if}
</Popover.Root>

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
