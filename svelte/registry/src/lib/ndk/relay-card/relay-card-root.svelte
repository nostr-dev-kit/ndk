<!--
  @component RelayCard.Root
  Root container that provides context for RelayCard subcomponents.

  @example
  ```svelte
  <RelayCard.Root {ndk} relayUrl="wss://relay.damus.io">
    <RelayCard.Icon />
    <RelayCard.Name />
  </RelayCard.Root>
  ```
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createRelayInfo } from '@nostr-dev-kit/svelte';
  import { RELAY_CARD_CONTEXT_KEY, type RelayCardContext } from './context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Relay URL */
    relayUrl: string;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;

    /** Child components */
    children: Snippet;
  }

  let {
    ndk,
    relayUrl,
    onclick,
    class: className = '',
    children
  }: Props = $props();

  // Fetch relay info (NIP-11) - reactive to relayUrl changes
  const relayInfo = createRelayInfo({ ndk, relayUrl: () => relayUrl });

  // Create reactive context with getters
  const context = {
    get ndk() { return ndk; },
    get relayUrl() { return relayUrl; },
    get relayInfo() { return relayInfo; },
    get onclick() { return onclick; }
  };

  setContext(RELAY_CARD_CONTEXT_KEY, context);
</script>

<div class="relay-card-root {className}">
  {@render children()}
</div>

<style>
  .relay-card-root {
    display: contents;
  }
</style>
