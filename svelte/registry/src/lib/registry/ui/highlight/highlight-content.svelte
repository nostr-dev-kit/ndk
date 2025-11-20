<script lang="ts">
  import { getContext } from 'svelte';
  import {
    HIGHLIGHT_CONTEXT_KEY,
    type HighlightContext,
  } from './highlight.context.js';

  interface Props {
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
