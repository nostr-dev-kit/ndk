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
    size = 'text-sm',
    class: className = '',
    truncate = true
  }: Props = $props();

  const context = getContext<RelayCardContext>(RELAY_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('RelayCard.Url must be used within RelayCard.Root');
  }
</script>

<span class={cn('relay-card-url', size, truncate && 'relay-card-url-truncate', className)}>
  {context.relayInfo.url}
</span>

<style>
  .relay-card-url {
    color: var(--muted-foreground, #6b7280);
    font-family: monospace;
    font-size: 0.875em;
  }

  .relay-card-url-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    max-width: 100%;
  }
</style>
