<!--
  @component ReactionAction
  Reaction button with long-press emoji picker support.
  Can be used standalone OR within EventCard context.
  Uses NIP-30 for custom emoji tags and NIP-51 for user preferences.

  @example Standalone
  ```svelte
  <ReactionAction {ndk} {event} />
  <ReactionAction {ndk} {event} emoji="🔥" showCount={false} />
  ```

  @example In EventCard
  ```svelte
  <EventCard.Actions>
    <ReactionAction />
    <ReactionAction emoji="🚀" />
  </EventCard.Actions>
  ```
-->
<script lang="ts">
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import EmojiPicker from './emoji-picker.svelte';

  interface EmojiData {
    emoji: string;
    shortcode?: string;
    url?: string;
  }

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
  const ndk = $derived(ndkProp || ctx?.ndk);
  const event = $derived(eventProp || ctx?.event);

  // Use the builder for reactive state
  const reaction = createReactionAction(ndk, () => event, () => emoji);

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
    if (!ndk?.$currentUser) {
      console.log('User must be logged in to react');
      return;
    }

    try {
      await reaction.toggle();
    } catch (error) {
      console.error('Failed to react:', error);
    }
  }

  async function handleEmojiSelect(emojiData: EmojiData) {
    if (!ndk?.$currentUser) {
      console.log('User must be logged in to react');
      return;
    }

    try {
      await publishReaction(emojiData);
    } catch (error) {
      console.error('Failed to publish reaction:', error);
    }
  }

  async function publishReaction(emojiData: EmojiData) {
    if (!event?.id) return;

    const reactionEvent = new NDKEvent(ndk, {
      kind: NDKKind.Reaction,
      content: emojiData.emoji,
      tags: [
        ['e', event.id],
        ['p', event.pubkey]
      ]
    });

    // Add custom emoji tag if this is a custom emoji (NIP-30)
    if (emojiData.shortcode && emojiData.url) {
      reactionEvent.tags.push(['emoji', emojiData.shortcode, emojiData.url]);
    }

    await reactionEvent.publish();
  }
</script>

<button
  class={cn(
    'reaction-button',
    reaction.hasReacted && 'reaction-button--active',
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
    class="heart-icon"
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={reaction.hasReacted ? 'currentColor' : 'none'}
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>

  {#if showCount && reaction.count > 0}
    <span class="reaction-count">{reaction.count}</span>
  {/if}
</button>

{#if showPicker && ndk}
  <EmojiPicker
    {ndk}
    onSelect={handleEmojiSelect}
    onClose={() => showPicker = false}
  />
{/if}

<style>
  .reaction-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }

  .reaction-button--active {
    color: #ef4444 !important;
  }

  .reaction-button--active:hover {
    color: #ef4444 !important;
  }

  .reaction-button--active .heart-icon {
    animation: heartbeat 0.3s ease-in-out;
  }

  .heart-icon {
    flex-shrink: 0;
  }

  .reaction-count {
    font-size: 0.875rem;
    font-weight: 500;
    min-width: 1rem;
    text-align: center;
  }

  @keyframes heartbeat {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }
</style>
