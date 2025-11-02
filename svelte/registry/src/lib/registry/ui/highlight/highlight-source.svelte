<!-- @ndk-version: highlight@0.8.0 -->
<!--
  @component Highlight.Source
  Displays the source for the highlight (web URL, article, or event).

  @example Basic usage:
  ```svelte
  <Highlight.Source />
  ```

  @example With custom element:
  ```svelte
  <Highlight.Source>
    {#snippet child({ props, source })}
      <a {...props} href={source.url} class="custom-link">
        View source: {source.displayText}
      </a>
    {/snippet}
  </Highlight.Source>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import {
    HIGHLIGHT_CONTEXT_KEY,
    type HighlightContext,
  } from './context.svelte.js';
  import type { Snippet } from 'svelte';
  import { mergeProps } from '../../utils/index.js';

  interface SourceSnippetProps {
    source: typeof context.state.source;
  }

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Child snippet for custom element rendering */
    child?: Snippet<[{ props: any; source: typeof context.state.source }]>;

    /** Content snippet for custom content */
    children?: Snippet<[SourceSnippetProps]>;
  }

  let {
    class: className = '',
    onclick,
    child,
    children,
    ...restProps
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

  const mergedProps = $derived(mergeProps(restProps, {
    type: 'button',
    onclick: handleClick,
    class: className
  }));
</script>

{#if context.state.source}
  {#if child}
    {@render child({ props: mergedProps, source: context.state.source })}
  {:else}
    <button {...mergedProps}>
      {#if children}
        {@render children({ source: context.state.source })}
      {:else}
        {context.state.source.displayText}
      {/if}
    </button>
  {/if}
{/if}
