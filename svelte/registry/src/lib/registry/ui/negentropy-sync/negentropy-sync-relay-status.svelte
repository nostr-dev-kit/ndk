<script lang="ts">
  import { getContext } from 'svelte';
  import { NEGENTROPY_SYNC_CONTEXT_KEY, type NegentropySyncContext } from './negentropy-sync.context.js';
  import { cn } from "../../utils/cn.js";

  interface Props {
    class?: string;

    showCounts?: boolean;
  }

  let {
    class: className = '',
    showCounts = true
  }: Props = $props();

  const context = getContext<NegentropySyncContext>(NEGENTROPY_SYNC_CONTEXT_KEY);
  if (!context) {
    throw new Error('NegentrogySync.RelayStatus must be used within NegentrogySync.Root');
  }

  function getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return '✓';
      case 'error': return '✗';
      case 'syncing': return '⟳';
      default: return '○';
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'syncing': return 'text-blue-600 animate-spin';
      default: return 'text-gray-400';
    }
  }
</script>

<div class={cn("space-y-1", className)}>
  {#each context.relays as relay (relay.url)}
    <div class="flex flex-col text-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <span class={cn("flex-shrink-0", getStatusColor(relay.status))}>
            {getStatusIcon(relay.status)}
          </span>
          <span class="truncate text-gray-700 dark:text-gray-300" title={relay.url}>
            {relay.url.replace('wss://', '').replace('ws://', '')}
          </span>
        </div>
        {#if showCounts && relay.eventCount > 0}
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {relay.eventCount} events
          </span>
        {/if}
        {#if relay.error}
          <span class="text-xs text-red-500 ml-2" title={relay.error}>
            Error
          </span>
        {/if}
      </div>

      {#if relay.negotiation && relay.status === 'syncing'}
        <div class="ml-6 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Round {relay.negotiation.round} - {relay.negotiation.phase}
          {#if relay.negotiation.needCount > 0 || relay.negotiation.haveCount > 0}
            <span class="ml-2">
              (Need: {relay.negotiation.needCount}, Have: {relay.negotiation.haveCount})
            </span>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>
