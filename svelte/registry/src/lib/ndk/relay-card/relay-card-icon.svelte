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
    <svg viewBox="0 0 24 24" fill="currentColor" class="relay-card-icon-svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
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
