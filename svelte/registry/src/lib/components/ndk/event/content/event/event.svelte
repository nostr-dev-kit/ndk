<!-- @ndk-version: embedded-event@0.8.0 -->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createEmbeddedEvent } from '@nostr-dev-kit/svelte';
  import { defaultKindRegistry, type KindRegistry } from '../registry.svelte';
  import GenericEmbedded from './generic-embedded.svelte';

  // Load default handlers
  import '../embedded-handlers';

  interface EmbeddedEventProps {
    ndk: NDKSvelte;
    bech32: string;
    variant?: 'inline' | 'card' | 'compact';
    kindRegistry?: KindRegistry;
    class?: string;
  }

  let {
    ndk,
    bech32,
    variant = 'card',
    kindRegistry = defaultKindRegistry,
    class: className = ''
  }: EmbeddedEventProps = $props();

  const embedded = createEmbeddedEvent(() => ({ bech32 }), ndk);

  // Lookup handler from registry
  let handlerInfo = $derived(kindRegistry.get(embedded.event?.kind));

  let Handler = $derived(handlerInfo?.component ?? GenericEmbedded);

  // Wrap event using NDK wrapper class if available
  let wrappedEvent = $derived(
    embedded.event && handlerInfo?.wrapper?.from
      ? handlerInfo.wrapper.from(embedded.event)
      : embedded.event
  );
</script>

{#if embedded.loading}
  <div class="embedded-loading {className}">
    <div class="loading-spinner"></div>
    <span>Loading event...</span>
  </div>
{:else if embedded.error}
  <div class="embedded-error {className}">
    <span>Failed to load event</span>
  </div>
{:else if wrappedEvent && Handler}
  <Handler {ndk} event={wrappedEvent} {variant} />
{/if}

<style>
  .embedded-loading,
  .embedded-error {
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
    background: var(--color-muted);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .loading-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--color-primary);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .embedded-error {
    color: var(--color-destructive);
  }
</style>
