<script lang="ts">
  import type { EmojiData } from './createEmojiPicker.svelte.js';
  import { cn } from '../../utils/cn.js';
  import Item from './emoji-picker-item.svelte';

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
  {#each emojis as emojiData (emojiData.unicode)}
    <Item emoji={emojiData} {onSelect} />
  {/each}
</div>
