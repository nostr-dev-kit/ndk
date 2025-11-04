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

<div class="border border-gray-200 rounded-xl p-6 bg-white flex flex-col gap-4">
  {#each exampleZaps as zap (zap.id || zap)}
    <div class="bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 rounded-xl p-5 shadow-amber-400/10 shadow-md">
      <div class="flex items-center gap-2">
        <div class="text-2xl">⚡</div>
        <ZapAmount {zap} class="text-2xl font-extrabold text-amber-800" />
        <span class="text-sm font-semibold text-amber-900">sats</span>
      </div>
      {#if zap.comment}
        <div class="mt-3 pt-3 border-t border-amber-800/20 text-amber-950 leading-relaxed">
          <ZapContent {zap} />
        </div>
      {/if}
    </div>
  {/each}
</div>
