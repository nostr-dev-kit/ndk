<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createRelayInfo } from '@nostr-dev-kit/svelte';
  import { RELAY_CONTEXT_KEY, type RelayContext } from './relay.context.js';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    ndk?: NDKSvelte;

    relayUrl: string;

    onclick?: (e: MouseEvent) => void;

    class?: string;

    children: Snippet;
  }

  let {
    ndk: providedNdk,
    relayUrl,
    onclick,
    class: className = '',
    children
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // Fetch relay info (NIP-11) - reactive to relayUrl changes
  const relayInfo = createRelayInfo(() => ({ relayUrl }), ndk);

  // Create reactive context with getters
  const context = {
    get ndk() { return ndk; },
    get relayUrl() { return relayUrl; },
    get relayInfo() { return relayInfo; },
    get onclick() { return onclick; }
  };

  setContext(RELAY_CONTEXT_KEY, context);
</script>

<div class="contents {className}">
  {@render children()}
</div>
