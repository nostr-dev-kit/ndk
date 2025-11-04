<script lang="ts">
  import { cn } from '../../utils/cn.js';
  import type { Snippet } from 'svelte';

  interface Props {
    /** Display variant */
    variant?: 'default' | 'compact' | 'vertical';

    /** Additional CSS classes */
    class?: string;

    /** Custom action buttons */
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