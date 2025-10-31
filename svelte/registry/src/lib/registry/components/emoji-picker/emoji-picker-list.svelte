<!-- @ndk-version: emoji-picker@0.2.0 -->
<!--
  @component EmojiPicker.List
  Primitive emoji grid component - renders a clickable list of emojis

  @example
  ```svelte
  <EmojiPicker.List
    emojis={[{ emoji: '❤️' }, { emoji: '👍' }]}
    onSelect={(emoji) => console.log(emoji)}
    columns={6}
  />
  ```
-->
<script lang="ts">
  import type { EmojiData } from '@nostr-dev-kit/svelte';
  import { cn } from '../../../utils.js';

  interface Props {
    /** Array of emojis to display */
    emojis: EmojiData[];

    /** Callback when emoji is clicked */
    onSelect: (emoji: EmojiData) => void;

    /** Number of columns in grid (default: 6) */
    columns?: number;

    /** Additional CSS classes */
    class?: string;
  }

  let { emojis, onSelect, columns = 6, class: className = '' }: Props = $props();
</script>

<div class={cn('emoji-list', className)} style="--emoji-columns: {columns};">
  {#each emojis as emojiData}
    <button
      class="emoji-button"
      onclick={() => onSelect(emojiData)}
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

<style>
  .emoji-list {
    display: grid;
    grid-template-columns: repeat(var(--emoji-columns, 6), 1fr);
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
    background: var(--color-accent);
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
    .emoji-char {
      font-size: 1.5rem;
    }
  }
</style>
