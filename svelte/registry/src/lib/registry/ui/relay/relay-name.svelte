<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CONTEXT_KEY, type RelayContext } from './relay.context.js';
  import { cn } from '../../utils/cn.js';

  interface Props {
    size?: string;

    class?: string;

    truncate?: boolean;
  }

  let {
    size = 'text-base',
    class: className = '',
    truncate = true
  }: Props = $props();

  const context = getContext<RelayContext>(RELAY_CONTEXT_KEY);
  if (!context) {
    throw new Error('Relay.Name must be used within Relay.Root');
  }

  const displayName = $derived(
    context.relayInfo.nip11?.name ||
    context.relayInfo.url.replace('wss://', '').replace('ws://', '')
  );
</script>

<span class={cn(size, truncate && 'truncate block max-w-full', className)}>
  {displayName}
</span>
