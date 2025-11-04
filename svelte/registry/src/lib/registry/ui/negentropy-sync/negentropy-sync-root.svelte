<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKFilter } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createNegentropySync, type NegentropySyncConfig } from '../../builders/negentropy-sync/index.js';
  import { NEGENTROPY_SYNC_CONTEXT_KEY, type NegentropySyncContext } from './context.svelte.js';
  import type { Snippet } from 'svelte';
  import { cn } from "../../utils/cn.js";

  interface Props {
    /** NDK instance (required) */
    ndk: NDKSvelte;

    /** Nostr filters to sync */
    filters: NDKFilter | NDKFilter[];

    /** Optional relay URLs to sync with (defaults to all NDK relays) */
    relayUrls?: string[];

    /** Additional CSS classes */
    class?: string;

    /** Child components */
    children: Snippet;
  }

  let {
    ndk,
    filters,
    relayUrls,
    class: className = '',
    children
  }: Props = $props();

  // Create sync builder
  const syncBuilder = createNegentropySync(() => ({
    filters,
    relayUrls
  }), ndk);

  // Create reactive context using getters to preserve reactivity
  const context: NegentropySyncContext = {
    get ndk() { return ndk; },
    get syncing() { return syncBuilder.syncing; },
    get totalRelays() { return syncBuilder.totalRelays; },
    get completedRelays() { return syncBuilder.completedRelays; },
    get totalEvents() { return syncBuilder.totalEvents; },
    get progress() { return syncBuilder.progress; },
    get relays() { return syncBuilder.relays; },
    get errors() { return syncBuilder.errors; }
  };

  setContext(NEGENTROPY_SYNC_CONTEXT_KEY, context);

  // Expose builder for imperative actions
  setContext('negentropy-sync-builder', syncBuilder);
</script>

<div class={cn("contents", className)}>
  {@render children()}
</div>
