<!--
  @component Relay.Url
  Displays the relay URL.

  @example
  ```svelte
  <Relay.Root {ndk} {relayUrl}>
    <Relay.Url class="text-sm text-muted" />
  </Relay.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CONTEXT_KEY, type RelayContext } from './context.svelte.js';
  import { cn } from '../../../utils.js';

  interface Props {
    /** Text size classes */
    size?: string;

    /** Additional CSS classes */
    class?: string;

    /** Whether to truncate */
    truncate?: boolean;

    /** Whether to show protocol (wss://, ws://) */
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
      ? context.relayInfo.url
      : context.relayInfo.url.replace('wss://', '').replace('ws://', '')
  );
</script>

<span class={cn(size, truncate && 'truncate block max-w-full', 'opacity-70', className)}>
  {displayUrl}
</span>
