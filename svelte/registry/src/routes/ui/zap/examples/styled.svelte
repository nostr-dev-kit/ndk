<script lang="ts">
  import { ZapAmount, ZapContent } from '$lib/registry/ui';
  import type { ProcessedZap } from '@nostr-dev-kit/svelte';

  const exampleZaps: ProcessedZap[] = [
    {
      amount: 2100,
      comment: 'Excellent work! Keep it up!',
      sender: { pubkey: 'abc123' }
    },
    {
      amount: 5000,
      comment: 'This is amazing content, thank you',
      sender: { pubkey: 'def456' }
    }
  ] as ProcessedZap[];
</script>

<div class="styled-demo">
  {#each exampleZaps as zap}
    <div class="zap-card">
      <div class="zap-header">
        <div class="lightning">⚡</div>
        <ZapAmount {zap} class="amount" />
        <span class="sats">sats</span>
      </div>
      {#if zap.comment}
        <div class="zap-comment">
          <ZapContent {zap} />
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .styled-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .zap-card {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 2px solid #fbbf24;
    border-radius: 0.75rem;
    padding: 1.25rem;
    box-shadow: 0 4px 6px rgba(251, 191, 36, 0.1);
  }

  .zap-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .lightning {
    font-size: 1.5rem;
  }

  .zap-header :global(.amount) {
    font-size: 1.5rem;
    font-weight: 800;
    color: #b45309;
  }

  .sats {
    font-size: 0.875rem;
    font-weight: 600;
    color: #92400e;
  }

  .zap-comment {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(180, 83, 9, 0.2);
    color: #78350f;
    line-height: 1.5;
  }
</style>
