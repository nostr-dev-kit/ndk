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
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createEmojiPicker, type EmojiData } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';

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

  // Use the emoji picker builder for user's custom emojis from Nostr
  const emojiPicker = createEmojiPicker(ndk);
  const preferredEmojis = $derived(emojiPicker.emojis);

  // Standard emojis defined at component level (UI concern)
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

  function handleSelect(emoji: EmojiData) {
    onSelect(emoji);
    onClose();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<div
  class={cn('emoji-picker-backdrop', className)}
  onclick={handleBackdropClick}
  onkeydown={handleKeydown}
  role="dialog"
  aria-modal="true"
  aria-label="Emoji picker"
  tabindex="-1"
>
  <div class="emoji-picker" onclick={(e) => e.stopPropagation()} role="document">
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
    background: color-mix(in srgb, var(--foreground) 30%, transparent);
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
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 10px 40px color-mix(in srgb, var(--foreground) 20%, transparent);
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
    border-bottom: 1px solid var(--border);
  }

  .emoji-picker-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--foreground);
  }

  .emoji-picker-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .emoji-picker-close:hover {
    background: var(--accent);
    color: var(--foreground);
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
    color: var(--muted-foreground);
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
    background: var(--accent);
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
