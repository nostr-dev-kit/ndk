<!-- @ndk-version: highlight@0.7.0 -->
<!--
  @component Highlight.Source
  Displays the source for the highlight (web URL, article, or event).

  @example
  ```svelte
  <Highlight.Source />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import {
    HIGHLIGHT_CONTEXT_KEY,
    type HighlightContext,
  } from './context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Custom children slot */
    children?: Snippet<[{ source: typeof context.state.source }]>;
  }

  let {
    class: className = '',
    onclick,
    children,
  }: Props = $props();

  const context = getContext<HighlightContext>(HIGHLIGHT_CONTEXT_KEY);
  if (!context) {
    throw new Error('Highlight.Source must be used within Highlight.Root');
  }

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    if (onclick) {
      onclick(e);
    } else if (context.state.source?.type === 'web' && context.state.source.url) {
      window.open(context.state.source.url, '_blank', 'noopener,noreferrer');
    }
  }
</script>

{#if context.state.source}
  <button
    type="button"
    onclick={handleClick}
    class={className}
  >
    {#if children}
      {@render children({ source: context.state.source })}
    {:else}
      {context.state.source.displayText}
    {/if}
  </button>
{/if}
