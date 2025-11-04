<script lang="ts">
  import { getContext } from 'svelte';
  import { NEGENTROPY_SYNC_CONTEXT_KEY, type NegentropySyncContext } from './context.svelte.js';
  import { cn } from "../../utils/cn.js";

  interface Props {
    /** Additional CSS classes */
    class?: string;

    /** Layout direction */
    direction?: 'horizontal' | 'vertical';
  }

  let {
    class: className = '',
    direction = 'horizontal'
  }: Props = $props();

  const context = getContext<NegentropySyncContext>(NEGENTROPY_SYNC_CONTEXT_KEY);
  if (!context) {
    throw new Error('NegentrogySync.Stats must be used within NegentrogySync.Root');
  }
</script>

<div class={cn(
  "flex gap-4",
  direction === 'vertical' ? "flex-col" : "flex-row",
  className
)}>
  <div class="flex flex-col">
    <span class="text-xs text-gray-500 dark:text-gray-400">Relays</span>
    <span class="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {context.completedRelays}/{context.totalRelays}
    </span>
  </div>

  <div class="flex flex-col">
    <span class="text-xs text-gray-500 dark:text-gray-400">Events</span>
    <span class="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {context.totalEvents.toLocaleString()}
    </span>
  </div>

  {#if context.errors.size > 0}
    <div class="flex flex-col">
      <span class="text-xs text-gray-500 dark:text-gray-400">Errors</span>
      <span class="text-lg font-semibold text-red-600">
        {context.errors.size}
      </span>
    </div>
  {/if}

  <div class="flex flex-col">
    <span class="text-xs text-gray-500 dark:text-gray-400">Status</span>
    <span class={cn(
      "text-lg font-semibold",
      context.syncing ? "text-blue-600" : "text-green-600"
    )}>
      {context.syncing ? 'Syncing...' : 'Complete'}
    </span>
  </div>
</div>
