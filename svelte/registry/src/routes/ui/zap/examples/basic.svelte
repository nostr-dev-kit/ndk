<script lang="ts">
  import { ZapAmount, ZapContent } from '$lib/registry/ui';
  import type { ProcessedZap } from '@nostr-dev-kit/svelte';

  // Example zap data
  const exampleZaps: ProcessedZap[] = [
    {
      amount: 21,
      comment: 'Great post!',
      sender: { pubkey: 'abc123' }
    },
    {
      amount: 1000,
      comment: 'Love this content',
      sender: { pubkey: 'def456' }
    },
    {
      amount: 500,
      comment: '',
      sender: { pubkey: 'ghi789' }
    }
  ] as ProcessedZap[];
</script>

<div class="zap-demo">
  <h3>Zap Display</h3>
  <div class="zap-list">
    {#each exampleZaps as zap}
      <div class="zap-item">
        <ZapAmount {zap} class="amount" /> sats
        {#if zap.comment}
          <ZapContent {zap} class="comment" />
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .zap-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    background: white;
  }

  .zap-demo h3 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #374151;
  }

  .zap-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .zap-item {
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .zap-item :global(.amount) {
    font-weight: 700;
    color: #f59e0b;
  }

  .zap-item :global(.comment) {
    color: #6b7280;
    font-size: 0.875rem;
  }
</style>
