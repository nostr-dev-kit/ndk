<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte';

  interface Props {
    ndk: NDKSvelte;
    eventBech32: string;
  }

  let { ndk, eventBech32 }: Props = $props();
</script>

<div class="embedded-demo">
  <p class="mb-2">Card variant (default):</p>
  <EmbeddedEvent {ndk} bech32={eventBech32} variant="card" />
</div>

<style>
  .embedded-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    background: white;
  }

  .mb-2 {
    margin-bottom: 0.5rem;
  }
</style>
