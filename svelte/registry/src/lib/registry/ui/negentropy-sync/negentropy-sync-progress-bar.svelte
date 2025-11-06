<script lang="ts">
  import { getContext } from 'svelte';
  import { NEGENTROPY_SYNC_CONTEXT_KEY, type NegentropySyncContext } from './negentropy-sync.context.js';
  import { cn } from "../../utils/cn.js";

  interface Props {
    class?: string;

    barClass?: string;

    showPercentage?: boolean;
  }

  let {
    class: className = '',
    barClass = '',
    showPercentage = false
  }: Props = $props();

  const context = getContext<NegentropySyncContext>(NEGENTROPY_SYNC_CONTEXT_KEY);
  if (!context) {
    throw new Error('NegentrogySync.ProgressBar must be used within NegentrogySync.Root');
  }
</script>

<div class={cn("relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", className)}>
  <div
    class={cn(
      "h-full transition-all duration-300 ease-out",
      context.syncing ? "bg-blue-600" : "bg-green-600",
      barClass
    )}
    style="width: {context.progress}%"
  ></div>
  {#if showPercentage}
    <span class="absolute inset-0 flex items-center justify-center text-xs font-medium">
      {context.progress}%
    </span>
  {/if}
</div>
