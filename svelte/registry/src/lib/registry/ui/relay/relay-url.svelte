<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CONTEXT_KEY, type RelayContext } from './relay.context.js';
  import { cn } from '../../utils/cn.js';

  interface Props {
    size?: string;

    class?: string;

    truncate?: boolean;

    showProtocol?: boolean;
  }

  let {
    size = 'text-sm',
    class: className = '',
    truncate = true,
    showProtocol = true
  }: Props = $props();

  const context = getContext<RelayContext>(RELAY_CONTEXT_KEY);
  if (!context) {
    throw new Error('Relay.Url must be used within Relay.Root');
  }

  const displayUrl = $derived(
    showProtocol
      ? context.relayInfo.url ?? ''
      : context.relayInfo.url?.replace('wss://', '').replace('ws://', '') ?? ''
  );
</script>

<span class={cn(size, truncate && 'truncate block max-w-full', 'opacity-70', className)}>
  {displayUrl}
</span>
