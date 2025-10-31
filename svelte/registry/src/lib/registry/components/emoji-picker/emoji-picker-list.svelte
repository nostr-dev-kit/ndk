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

<div
  class={cn('grid gap-2 max-w-full', className)}
  style="grid-template-columns: repeat({columns}, minmax(0, 1fr));"
>
  {#each emojis as emojiData}
    <button
      class="flex items-center justify-center w-full aspect-square border-0 bg-transparent cursor-pointer rounded-lg transition-all duration-150 p-2 hover:bg-accent hover:scale-110 active:scale-95"
      onclick={() => onSelect(emojiData)}
      aria-label={emojiData.shortcode || emojiData.emoji}
    >
      {#if emojiData.url}
        <img
          src={emojiData.url}
          alt={emojiData.shortcode}
          class="max-w-6 max-h-6 w-full h-full object-contain"
        />
      {:else}
        <span class="text-2xl leading-none sm:text-xl">{emojiData.emoji}</span>
      {/if}
    </button>
  {/each}
</div>
