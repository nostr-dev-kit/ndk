<script lang="ts">
  import { EditProps } from '$lib/site-components/edit-props';
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle?: string;
    children?: Snippet;
  }

  let { title, subtitle, children }: Props = $props();
</script>

<div class="mb-12 pt-8">
  <div class="flex items-start justify-between gap-4 mb-4">
    <h1 class="text-6xl font-black">{title}</h1>

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
</div>
