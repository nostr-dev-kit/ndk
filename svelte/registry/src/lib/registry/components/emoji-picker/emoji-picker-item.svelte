<!-- @ndk-version: emoji-picker@0.3.0 -->
<!--
  @component EmojiPicker.Item
  Headless emoji button for picker grids.

  @example Basic usage:
  ```svelte
  <EmojiPicker.Item
    emoji={{ emoji: '❤️' }}
    onSelect={(emoji) => console.log(emoji)}
  />
  ```

  @example Custom button:
  ```svelte
  <EmojiPicker.Item emoji={emojiData} {onSelect}>
    {#snippet child({ props, emoji })}
      <button {...props} class="custom-emoji-btn">
        <img src={emoji.url} alt={emoji.shortcode} />
      </button>
    {/snippet}
  </EmojiPicker.Item>
  ```
-->
<script lang="ts">
  import type { EmojiData } from './createEmojiPicker.svelte.js';
  import { Reaction } from '../../ui/reaction';
  import type { Snippet } from 'svelte';
  import { mergeProps } from '../../utils/index.js';

  interface EmojiSnippetProps {
    emoji: EmojiData;
  }

  interface Props {
    /** Emoji data to display */
    emoji: EmojiData;

    /** Callback when emoji is selected */
    onSelect: (emoji: EmojiData) => void;

    /** Additional CSS classes */
    class?: string;

    /** Child snippet for custom element rendering */
    child?: Snippet<[{ props: any } & EmojiSnippetProps]>;

    /** Content snippet for custom content */
    children?: Snippet<[EmojiSnippetProps]>;
  }

  let {
    emoji,
    onSelect,
    class: className = '',
    child,
    children,
    ...restProps
  }: Props = $props();

  const mergedProps = $derived(mergeProps(restProps, {
    type: 'button' as const,
    onclick: () => onSelect(emoji),
    'aria-label': emoji.shortcode || emoji.emoji,
    'data-emoji': emoji.emoji,
    'data-shortcode': emoji.shortcode,
    class: className
  }));

  const snippetProps = $derived({ emoji });
</script>

{#if child}
  {@render child({ props: mergedProps, ...snippetProps })}
{:else}
  <button {...mergedProps}>
    {#if children}
      {@render children(snippetProps)}
    {:else}
      <Reaction.Display
        emoji={emoji.emoji}
        url={emoji.url}
        shortcode={emoji.shortcode}
        class="w-6 h-6"
      />
    {/if}
  </button>
{/if}
