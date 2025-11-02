<!-- @ndk-version: emoji-picker@0.2.0 -->
<!--
  @component EmojiPicker.Item
  Individual emoji button for picker grids. Uses Reaction.Display for consistent rendering.

  @example
  ```svelte
  <EmojiPicker.Item
    emoji={{ emoji: '❤️' }}
    onSelect={(emoji) => console.log(emoji)}
  />
  ```
-->
<script lang="ts">
  import type { EmojiData } from './createEmojiPicker.svelte.js';
  import { Reaction } from '../reaction';
  import { cn } from '../../../utils.js';

  interface Props {
    /** Emoji data to display */
    emoji: EmojiData;

    /** Callback when emoji is selected */
    onSelect: (emoji: EmojiData) => void;

    /** Additional CSS classes */
    class?: string;
  }

  let { emoji, onSelect, class: className = '' }: Props = $props();
</script>

<button
  class={cn(
    'flex items-center justify-center w-full aspect-square border-0 bg-transparent cursor-pointer rounded-lg transition-all duration-150 p-2 hover:bg-accent hover:scale-110 active:scale-95',
    className
  )}
  onclick={() => onSelect(emoji)}
  aria-label={emoji.shortcode || emoji.emoji}
>
  <Reaction.Display
    emoji={emoji.emoji}
    url={emoji.url}
    shortcode={emoji.shortcode}
    size={24}
  />
</button>
