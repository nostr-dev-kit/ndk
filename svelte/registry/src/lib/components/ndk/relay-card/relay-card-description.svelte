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
  import { cn } from '../../../utils.js';

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

  const context = getContext<RelayCardContext>(RELAY_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('RelayCard.Description must be used within RelayCard.Root');
  }

  const description = $derived(context.relayInfo.nip11?.description || '');
</script>

{#if description}
  <p
    class={cn('overflow-hidden leading-relaxed m-0', size, className)}
    style:display="-webkit-box"
    style:-webkit-line-clamp={maxLines}
    style:-webkit-box-orient="vertical"
  >
    {description}
  </p>
{/if}
