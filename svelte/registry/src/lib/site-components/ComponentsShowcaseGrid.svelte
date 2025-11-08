<script lang="ts">
  import { cn } from '$lib/registry/utils/cn.js';
  import type { ShowcaseComponent } from '$lib/templates/types';

  interface Props {
    components: ShowcaseComponent[];
    class?: string;
  }

  let { components, class: className }: Props = $props();
</script>

<div class={cn('grid grid-cols-1 md:grid-cols-3 -mx-8', className)}>
  {#each components as component, index (component.name)}
    <div
      class={cn(
        'flex flex-col items-center justify-center px-8 py-12 min-h-[280px] border-border transition-colors group relative  overflow-clip',
        index % 3 !== 2 && 'md:border-r',
        index >= 3 && 'border-t',
        component.cellClass
      )}
    >
      <!-- Title and description -->
      <div class="bg-linear-to-t from-background to-transparent z-50 mb-6 text-center brightness-50 opacity-0 -bottom-16 group-hover:opacity-100 group-hover:brightness-100 transition-all duration-700 absolute group-hover:bottom-0">
        <h3 class="text-base font-semibold text-foreground transition-colors mb-1">{component.name}</h3>
        <p class="text-sm text-muted-foreground transition-colors">{component.description}</p>
      </div>

      <!-- Preview -->
      <div
        class="flex-1 flex items-center justify-center w-full grayscale group-hover:grayscale-0"
        onclick={(e) => e.stopPropagation()}
      >
        {@render component.preview()}
      </div>
    </div>
  {/each}
</div>
