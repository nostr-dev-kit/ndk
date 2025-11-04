<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CONTEXT_KEY, type RelayContext } from './relay.context.js';
  import { cn } from '../../utils/cn.js';

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

  const context = getContext<RelayContext>(RELAY_CONTEXT_KEY);
  if (!context) {
    throw new Error('Relay.Description must be used within Relay.Root');
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
