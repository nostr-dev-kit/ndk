<!--
  @component RelayCard.Icon
  Displays relay icon from NIP-11 or fallback.

  @example
  ```svelte
  <RelayCard.Root {ndk} {relayUrl}>
    <RelayCard.Icon size={48} />
  </RelayCard.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { RELAY_CARD_CONTEXT_KEY, type RelayCardContext } from './context.svelte.js';
  import { cn } from '$lib/utils';

  interface Props {
    /** Icon size in pixels */
    size?: number;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    size = 48,
    class: className = ''
  }: Props = $props();

  const context = getContext<RelayCardContext>(RELAY_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('RelayCard.Icon must be used within RelayCard.Root');
  }

  const icon = $derived(context.relayInfo.nip11?.icon);
  const name = $derived(context.relayInfo.nip11?.name || context.relayInfo.url);
</script>

{#if icon}
  <img
    src={icon}
    alt={name}
    class={cn('relay-card-icon', className)}
    style="width: {size}px; height: {size}px;"
  />
{:else}
  <div
    class={cn('relay-card-icon relay-card-icon-fallback', className)}
    style="width: {size}px; height: {size}px;"
  >
    <i class="hugeicons-stroke-rounded relay-card-icon-svg">&#984839;</i>
  </div>
{/if}

<style>
  .relay-card-icon {
    border-radius: 0.5rem;
    object-fit: cover;
    flex-shrink: 0;
  }

  .relay-card-icon-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .relay-card-icon-svg {
    width: 60%;
    height: 60%;
  }
</style>
