<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EmbeddedEvent } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  // Example event reference (nevent)
  const eventBech32 = 'nevent1qqsxvfxz4g7x9y4x9y4x9y4x9y4x9y4x9y4x9y4x9y4x9y4x9y4x9';
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
