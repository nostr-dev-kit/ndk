<script lang="ts">
  import type { RelayStatus } from '@nostr-dev-kit/svelte';

  interface Props {
    status: RelayStatus;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    class?: string;
  }

  let { status, size = 'md', showLabel = false, class: className = '' }: Props = $props();

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

<div class="relay-status inline-flex items-center gap-2 {className}">
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

<style>
  @keyframes ping {
    75%,
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  .animate-ping {
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
</style>
