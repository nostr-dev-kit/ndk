<script lang="ts">
  import { EditProps } from '$lib/site/components/edit-props';
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle?: string;
    tags?: string[];
    children?: Snippet;
  }

  let { title, subtitle, tags, children }: Props = $props();
</script>

<div class="border-t-0 border border-border -mx-8 p-8 flex flex-col gap-2">
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-5xl font-bold">{title}</h1>

    {#if children}
    <EditProps.Root>
      {@render children()}
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  {/if}
  </div>
  {#if subtitle}
    <p class="text-lg text-muted-foreground">
      {subtitle}
    </p>
  {/if}
  {#if tags && tags.length > 0}
    <div class="flex flex-wrap gap-2 mt-3">
      {#each tags as tag (tag)}
        <span class="px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
          {tag}
        </span>
      {/each}
    </div>
  {/if}
</div>
