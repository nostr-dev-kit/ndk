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
  import { cn } from '../../../utils.js';

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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      class="relay-card-icon-svg"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
    >
      <path d="M2.5 12C2.5 7.522 2.5 5.282 3.891 3.891C5.282 2.5 7.521 2.5 12 2.5C16.478 2.5 18.718 2.5 20.109 3.891C21.5 5.282 21.5 7.521 21.5 12C21.5 16.478 21.5 18.718 20.109 20.109C18.718 21.5 16.478 21.5 12 21.5C7.521 21.5 5.282 21.5 3.891 20.109C2.5 18.718 2.5 16.478 2.5 12Z" />
      <path d="M11 15.5H12C14.828 15.5 17 13.828 17 11.75C17 9.672 14.828 8 12 8H11C8.172 8 6 9.672 6 11.75C6 13.828 8.172 15.5 11 15.5Z" />
    </svg>
  </div>
{/if}

<style>
  .relay-card-icon {
    border-radius: 1.5rem;
    object-fit: cover;
    flex-shrink: 0;
  }

  .relay-card-icon-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary);
    color: var(--primary-foreground);
  }

  .relay-card-icon-svg {
    width: 60%;
    height: 60%;
  }
</style>
