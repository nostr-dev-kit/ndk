<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte';

  interface Props {
    ndk: NDKSvelte;
    eventBech32: string;
  }

  let { ndk, eventBech32 }: Props = $props();
</script>

<div class="variants-demo">
  <div class="variant-section">
    <h3>Card (default)</h3>
    <EmbeddedEvent {ndk} bech32={eventBech32} variant="card" />
  </div>

  <div class="variant-section">
    <h3>Compact</h3>
    <EmbeddedEvent {ndk} bech32={eventBech32} variant="compact" />
  </div>

  <div class="variant-section">
    <h3>Inline</h3>
    <p>
      Check out this event:
      <EmbeddedEvent {ndk} bech32={eventBech32} variant="inline" />
      in the middle of text.
    </p>
  </div>
</div>

<style>
  .variants-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .variant-section h3 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #374151;
  }

  .variant-section p {
    line-height: 1.6;
  }
</style>
