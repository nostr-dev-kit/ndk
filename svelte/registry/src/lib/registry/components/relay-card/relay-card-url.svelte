<!--
  @component RelayCard.Url
  Displays the relay URL.

  @example
  ```svelte
  <RelayCard.Root {ndk} {relayUrl}>
    <RelayCard.Url class="text-sm text-muted" />
  </RelayCard.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CARD_CONTEXT_KEY, type RelayCardContext } from './context.svelte.js';
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

  const context = getContext<RelayCardContext>(RELAY_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('RelayCard.Url must be used within RelayCard.Root');
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
