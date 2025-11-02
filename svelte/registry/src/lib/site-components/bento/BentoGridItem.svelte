<script lang="ts">
  import { cn } from '$lib/utils.js';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    title?: string;
    description?: string;
    header?: Snippet;
    icon?: Snippet;
    children?: Snippet;
  }

  let {
    class: className,
    title,
    description,
    header,
    icon,
    children
  }: Props = $props();
</script>

<div
  class={cn(
    'group/bento row-span-1 rounded-xl overflow-hidden transition duration-200 hover:shadow-xl',
    className
  )}
>
  {#if header}
    {@render header()}
  {/if}
  {#if title || description || icon}
    <div class="flex flex-col justify-between space-y-4 border border-border bg-card p-4 shadow-sm">
      <div class="transition duration-200 group-hover/bento:translate-x-2">
        {#if icon}
          {@render icon()}
        {/if}
        {#if title}
          <div class="mb-2 mt-2 font-sans font-bold text-foreground">
            {title}
          </div>
        {/if}
        {#if description}
          <div class="font-sans text-xs font-normal text-muted-foreground">
            {description}
          </div>
        {/if}
      </div>
    </div>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>
