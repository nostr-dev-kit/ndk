<script lang="ts">
  import { cn } from '../../utils/cn.js';
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'compact' | 'vertical';

    class?: string;

    children?: Snippet;
  }

  let {
    variant = 'default',
    class: className = '',
    children
  }: Props = $props();

  // Stop propagation to prevent card navigation
  function stopPropagation(e: Event) {
    e.stopPropagation();
  }
</script>

<div
  data-event-card-actions=""
  data-variant={variant}
  class={cn(
    'flex items-center gap-12 select-none',
    variant === 'vertical' && 'flex-col gap-4',
    className
  )}
  onclick={stopPropagation}
  onkeydown={(e) => e.stopPropagation()}
  role="presentation"
>
  {#if children}
    {@render children()}
  {/if}
</div>