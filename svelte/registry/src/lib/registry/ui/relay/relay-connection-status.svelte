<script lang="ts">
  import { getContext } from 'svelte';
  import type { RelayStatus } from '@nostr-dev-kit/svelte';
  import { RELAY_CONTEXT_KEY, type RelayContext } from './relay.context.js';

  interface Props {
    status?: RelayStatus;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    class?: string;
  }

  let { status: providedStatus, size = 'md', showLabel = false, class: className = '' }: Props = $props();

  // Try to get context, but don't fail if not available
  const context = getContext<RelayContext | undefined>(RELAY_CONTEXT_KEY);

  // Get status from props or context
  const status = $derived.by(() => {
    if (providedStatus !== undefined) return providedStatus;

    // Get relay from NDK and its status
    if (context?.ndk && context?.relayUrl) {
      const relay = context.ndk.pool?.relays.get(context.relayUrl);
      return relay?.status || 'disconnected';
    }

    return 'disconnected';
  });

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusConfig = $derived.by(() => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          label: 'Connected',
          pulse: false,
        };
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          label: 'Connecting',
          pulse: true,
        };
      case 'reconnecting':
        return {
          color: 'bg-orange-500',
          label: 'Reconnecting',
          pulse: true,
        };
      case 'disconnected':
        return {
          color: 'bg-red-500',
          label: 'Disconnected',
          pulse: false,
        };
      default:
        return {
          color: 'bg-gray-500',
          label: 'Unknown',
          pulse: false,
        };
    }
  });
</script>

<div class="inline-flex items-center gap-2 {className}">
  <div class="relative {sizeClasses[size]}">
    <div class="absolute inset-0 rounded-full {statusConfig.color}"></div>
    {#if statusConfig.pulse}
      <div class="absolute inset-0 rounded-full {statusConfig.color} animate-ping opacity-75"></div>
    {/if}
  </div>
  {#if showLabel}
    <span class="text-sm font-medium">{statusConfig.label}</span>
  {/if}
</div>
