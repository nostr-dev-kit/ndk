<!-- @ndk-version: highlight@0.7.0 -->
<!--
  @component Highlight.Content
  Displays the highlight text with surrounding context.

  @example
  ```svelte
  <Highlight.Content />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import {
    HIGHLIGHT_CONTEXT_KEY,
    type HighlightContext,
  } from './context.svelte.js';

  interface Props {
    /** Additional CSS classes */
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const context = getContext<HighlightContext>(HIGHLIGHT_CONTEXT_KEY);
  if (!context) {
    throw new Error('Highlight.Content must be used within Highlight.Root');
  }
</script>

<div class={className}>
  {context.state.position.before}<mark
    >{context.state.position.highlight}</mark
  >{context.state.position.after}
</div>
