<!--
  @component RelayCard.Description
  Displays relay description from NIP-11.

  @example
  ```svelte
  <RelayCard.Root {ndk} {relayUrl}>
    <RelayCard.Description maxLines={2} />
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

    /** Max number of lines to show (line-clamp) */
    maxLines?: number;
  }

  let {
    size = 'text-sm',
    class: className = '',
    maxLines = 2
  }: Props = $props();

  const { relayInfo } = getContext<RelayCardContext>(RELAY_CARD_CONTEXT_KEY);

  const description = $derived(relayInfo.nip11?.description || '');
</script>

{#if description}
  <p
    class={cn('relay-card-description', size, className)}
    style:display="-webkit-box"
    style:-webkit-line-clamp={maxLines}
    style:-webkit-box-orient="vertical"
  >
    {description}
  </p>
{/if}

<style>
  .relay-card-description {
    color: var(--muted-foreground, #6b7280);
    overflow: hidden;
    line-height: 1.5;
    margin: 0;
  }
</style>
