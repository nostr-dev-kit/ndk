<!--
  @component EmojiPicker
  Emoji picker with standard emojis and user's preferred emojis from NIP-51 kind:10030

  @example
  ```svelte
  <EmojiPicker
    {ndk}
    onSelect={(emoji) => console.log(emoji)}
    onClose={() => showPicker = false}
  />
  ```
-->
<script lang="ts">
  import { NDKKind } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';

  interface EmojiData {
    /** The emoji character or :shortcode: */
    emoji: string;
    /** Optional shortcode for custom emojis */
    shortcode?: string;
    /** Optional image URL for custom emojis */
    url?: string;
  }

  interface Props {
    /** NDKSvelte instance */
    ndk: NDKSvelte;

    /** Callback when emoji is selected */
    onSelect: (emoji: EmojiData) => void;

    /** Callback when picker should close */
    onClose: () => void;

    /** Additional CSS classes */
    class?: string;
  }

  let { ndk, onSelect, onClose, class: className = '' }: Props = $props();

  // Standard emojis to show
  const standardEmojis: EmojiData[] = [
    { emoji: '❤️' },
    { emoji: '👍' },
    { emoji: '😂' },
    { emoji: '🔥' },
    { emoji: '🚀' },
    { emoji: '🎉' },
    { emoji: '👏' },
    { emoji: '💯' },
    { emoji: '🤔' },
    { emoji: '😍' },
    { emoji: '🙏' },
    { emoji: '💜' },
  ];

  // Subscribe to user's preferred emojis (kind 10030)
  const preferredEmojis = $derived.by(() => {
    if (!ndk.$currentPubkey) return [];

    const subscription = ndk.$subscribe(() => ({
      filters: [{
        kinds: [10030 as NDKKind],
        authors: [ndk.$currentPubkey!]
      }],
    }));

    const event = subscription.events[0];
    if (!event) return [];

    // Parse emoji tags from the event
    const emojis: EmojiData[] = [];
    for (const tag of event.tags) {
      if (tag[0] === 'emoji' && tag[1] && tag[2]) {
        emojis.push({
          emoji: `:${tag[1]}:`,
          shortcode: tag[1],
          url: tag[2]
        });
      }
    }

    return emojis;
  });

  function handleSelect(emoji: EmojiData) {
    onSelect(emoji);
    onClose();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

<div class={cn('emoji-picker-backdrop', className)} onclick={handleBackdropClick}>
  <div class="emoji-picker" onclick={(e) => e.stopPropagation()}>
    <div class="emoji-picker-header">
      <h3>Pick a reaction</h3>
      <button class="emoji-picker-close" onclick={onClose} aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="emoji-picker-body">
      {#if preferredEmojis.length > 0}
        <div class="emoji-section">
          <div class="emoji-section-title">Your Emojis</div>
          <div class="emoji-grid">
            {#each preferredEmojis as emojiData}
              <button
                class="emoji-button"
                onclick={() => handleSelect(emojiData)}
                aria-label={emojiData.shortcode || emojiData.emoji}
              >
                {#if emojiData.url}
                  <img src={emojiData.url} alt={emojiData.shortcode} class="custom-emoji" />
                {:else}
                  <span class="emoji-char">{emojiData.emoji}</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <div class="emoji-section">
        <div class="emoji-section-title">Standard</div>
        <div class="emoji-grid">
          {#each standardEmojis as emojiData}
            <button
              class="emoji-button"
              onclick={() => handleSelect(emojiData)}
              aria-label={emojiData.emoji}
            >
              <span class="emoji-char">{emojiData.emoji}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .emoji-picker-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .emoji-picker {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 400px;
    max-height: 500px;
    display: flex;
    flex-direction: column;
    animation: scaleIn 0.2s ease-out;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .emoji-picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .emoji-picker-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  .emoji-picker-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .emoji-picker-close:hover {
    background: #f3f4f6;
    color: #111827;
  }

  .emoji-picker-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.25rem;
  }

  .emoji-section {
    margin-bottom: 1.5rem;
  }

  .emoji-section:last-child {
    margin-bottom: 0;
  }

  .emoji-section-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    margin-bottom: 0.75rem;
  }

  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
  }

  .emoji-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.15s;
    padding: 0.5rem;
  }

  .emoji-button:hover {
    background: #f3f4f6;
    transform: scale(1.1);
  }

  .emoji-button:active {
    transform: scale(0.95);
  }

  .emoji-char {
    font-size: 1.75rem;
    line-height: 1;
  }

  .custom-emoji {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 640px) {
    .emoji-picker {
      max-width: none;
      width: 95%;
      max-height: 70vh;
    }

    .emoji-grid {
      grid-template-columns: repeat(5, 1fr);
    }

    .emoji-char {
      font-size: 1.5rem;
    }
  }
</style>
