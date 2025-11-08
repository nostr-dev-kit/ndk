<script lang="ts">
  import type { EmojiData } from './createEmojiPicker.svelte.js';
  import { cn } from '$lib/registry/utils/cn';
  import Item from './emoji-picker-item.svelte';

  interface Props {
    emojis: EmojiData[];

    onSelect: (emoji: EmojiData) => void;

    columns?: number;

    class?: string;
  }

  let { emojis, onSelect, columns = 6, class: className = '' }: Props = $props();

  // Helper to create unique key for emoji (matching createEmojiPicker logic)
  const getEmojiKey = (emoji: EmojiData): string => {
    return emoji.url ? emoji.url : emoji.emoji;
  };
</script>

<div
  data-emoji-picker-list=""
  data-columns={columns}
  class={cn('grid gap-2 max-w-full', className)}
  style="grid-template-columns: repeat({columns}, minmax(0, 1fr));"
>
  {#each emojis as emojiData (getEmojiKey(emojiData))}
    <Item emoji={emojiData} {onSelect} />
  {/each}
</div>
