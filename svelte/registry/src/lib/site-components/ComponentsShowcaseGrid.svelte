<script lang="ts">
  import { cn } from '$lib/registry/utils/index.js';

  interface GridBlock {
    name: string;
    description: string;
    preview: any; // Svelte snippet
    command: string;
    cardData?: any;
  }

  interface Props {
    blocks: GridBlock[];
    class?: string;
  }

  let { blocks, class: className }: Props = $props();
</script>

<div class={cn('grid grid-cols-1 md:grid-cols-3 -mx-8', className)}>
  {#each blocks as block, index}
    <div
      class={cn(
        'flex flex-col items-center justify-center px-8 py-12 min-h-[280px] border-border',
        index % 3 !== 2 && 'md:border-r',
        index >= 3 && 'border-t'
      )}
    >
      <!-- Title and description -->
      <div class="mb-6 text-center">
        <h3 class="text-base font-semibold text-foreground mb-1">{block.name}</h3>
        <p class="text-sm text-muted-foreground">{block.description}</p>
      </div>

      <!-- Preview -->
      <div class="flex-1 flex items-center justify-center w-full">
        {@render block.preview()}
      </div>
    </div>
  {/each}
</div>
