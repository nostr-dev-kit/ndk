<script lang="ts">
  import type { EmojiData } from './createEmojiPicker.svelte.js';
  import { Reaction } from '../../ui/reaction';
  import type { Snippet } from 'svelte';
  import { mergeProps } from '../../utils/merge-props.js';

  interface EmojiSnippetProps {
    emoji: EmojiData;
  }

  interface Props {
    emoji: EmojiData;

    onSelect: (emoji: EmojiData) => void;

    class?: string;

    child?: Snippet<[{ props: any } & EmojiSnippetProps]>;

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
  <button data-emoji-picker-item="" {...mergedProps}>
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
