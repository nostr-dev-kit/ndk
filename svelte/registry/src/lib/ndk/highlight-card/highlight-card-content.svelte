<!-- @ndk-version: highlight-card@0.0.0 -->
<!--
  @component HighlightCard.Content
  Displays the highlight text with surrounding context.

  @example
  ```svelte
  <HighlightCard.Content fontSize="text-xl" />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import {
    HIGHLIGHT_CARD_CONTEXT_KEY,
    type HighlightCardContext,
  } from './context.svelte.js';

  interface Props {
    /** Font size class */
    fontSize?: string;

    /** Additional CSS classes */
    class?: string;
  }

  let { fontSize, class: className = '' }: Props = $props();

  const context = getContext<HighlightCardContext>(HIGHLIGHT_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('HighlightCard.Content must be used within HighlightCard.Root');
  }

  // Calculate dynamic font size based on content length if not provided
  const calculatedFontSize = $derived.by(() => {
    if (fontSize) return fontSize;

    const totalLength = context.state.context.length;

    if (context.variant === 'grid') {
      // Grid variant uses smaller sizes
      if (totalLength < 100) return 'text-base';
      if (totalLength < 200) return 'text-sm';
      return 'text-xs';
    }

    // Feed and default variants
    if (totalLength < 100) return 'text-2xl sm:text-3xl md:text-4xl';
    if (totalLength < 200) return 'text-xl sm:text-2xl md:text-3xl';
    if (totalLength < 350) return 'text-lg sm:text-xl md:text-2xl';
    if (totalLength < 500) return 'text-base sm:text-lg md:text-xl';
    return 'text-sm sm:text-base md:text-lg';
  });
</script>

<div class={cn('highlight-card-content', className)}>
  <p
    class={cn(
      'text-card-foreground font-serif leading-relaxed',
      calculatedFontSize,
      context.variant === 'grid' ? 'text-center line-clamp-6' : 'text-center',
      context.variant === 'compact' ? 'italic' : ''
    )}
  >
    {#if context.variant === 'compact'}"
    {/if}{context.state.position.before}<mark
      class="bg-primary/20 text-card-foreground font-medium not-italic"
      >{context.state.position.highlight}</mark
    >{context.state.position.after}{#if context.variant === 'compact'}"
    {/if}
  </p>
</div>
