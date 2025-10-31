<!-- @ndk-version: highlight-card@0.7.0 -->
<!--
  @component HighlightCard.Source
  Displays the source badge for the highlight (web URL, article, or event).

  @example
  ```svelte
  <HighlightCard.Source position="bottom-right" />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from '../../../utils.js';
  import {
    HIGHLIGHT_CARD_CONTEXT_KEY,
    type HighlightCardContext,
  } from './context.svelte.js';
  import LinkIcon from '../icons/link.svelte';
  import FileIcon from '../icons/file.svelte';

  interface Props {
    /** Position of the badge */
    position?: 'bottom-right' | 'bottom-left' | 'inline';

    /** Size variant */
    size?: 'sm' | 'md';

    /** Additional CSS classes */
    class?: string;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;
  }

  let {
    position = 'bottom-right',
    size = 'md',
    class: className = '',
    onclick,
  }: Props = $props();

  const context = getContext<HighlightCardContext>(HIGHLIGHT_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('HighlightCard.Source must be used within HighlightCard.Root');
  }

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    if (onclick) {
      onclick(e);
    } else if (context.state.source?.type === 'web' && context.state.source.url) {
      window.open(context.state.source.url, '_blank', 'noopener,noreferrer');
    }
  }

  const iconSizeClass = $derived(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3');
  const textSize = $derived(size === 'sm' ? 'text-[10px]' : 'text-xs');
  const padding = $derived(size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5');
</script>

{#if context.state.source}
  <button
    type="button"
    onclick={handleClick}
    class={cn(
      'flex items-center gap-1.5',
      padding,
      'bg-background/80 backdrop-blur-sm border border-border rounded',
      textSize,
      'text-muted-foreground hover:bg-background transition-colors',
      position === 'bottom-right' && 'absolute bottom-2 right-2',
      position === 'bottom-left' && 'absolute bottom-2 left-2',
      position === 'inline' && 'relative',
      className
    )}
  >
    {#if context.state.source.type === 'web'}
      <LinkIcon class={iconSizeClass} />
    {:else if context.state.source.type === 'article'}
      <FileIcon class={iconSizeClass} />
    {:else}
      <FileIcon class={iconSizeClass} />
    {/if}
    <span
      class={cn(
        'truncate',
        size === 'sm' ? 'max-w-[100px]' : 'max-w-[200px]'
      )}
    >
      {context.state.source.displayText}
    </span>
  </button>
{/if}
