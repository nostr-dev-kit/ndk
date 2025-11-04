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

<div class="border border-gray-200 rounded-lg p-4 bg-white">
  <h3 class="text-sm font-semibold mb-4 text-gray-700">Zap Display</h3>
  <div class="flex flex-col gap-3">
    {#each exampleZaps as zap (zap.id || zap)}
      <div class="p-3 bg-gray-50 rounded-md flex items-center gap-2">
        <ZapAmount {zap} class="font-bold text-amber-500" /> sats
        {#if zap.comment}
          <ZapContent {zap} class="text-gray-500 text-sm" />
        {/if}
      </div>
    {/each}
  </div>
</div>
