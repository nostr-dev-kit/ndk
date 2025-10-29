<!--
  @component RelayCard.Name
  Displays relay name from NIP-11 or URL.

  @example
  ```svelte
  <RelayCard.Root {ndk} {relayUrl}>
    <RelayCard.Name class="font-bold" />
  </RelayCard.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CARD_CONTEXT_KEY, type RelayCardContext } from './context.svelte.js';
  import { cn } from '$lib/utils';

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

  const context = getContext<RelayCardContext>(RELAY_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('RelayCard.Name must be used within RelayCard.Root');
  }

  const displayName = $derived(
    context.relayInfo.nip11?.name ||
    context.relayInfo.url.replace('wss://', '').replace('ws://', '')
  );
</script>

<span class={cn(size, truncate && 'truncate block max-w-full', className)}>
  {displayName}
</span>
