<!--
  @component Relay.Name
  Displays relay name from NIP-11 or URL.

  @example
  ```svelte
  <Relay.Root {ndk} {relayUrl}>
    <Relay.Name class="font-bold" />
  </Relay.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CONTEXT_KEY, type RelayContext } from './context.svelte.js';
  import { cn } from '../../utils/index.js';

  interface Props {
    /** Text size classes */
    size?: string;

    /** Additional CSS classes */
    class?: string;

    /** Whether to truncate */
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
