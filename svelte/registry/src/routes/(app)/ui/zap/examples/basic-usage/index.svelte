<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, userPubkey } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
  import { Amount as ZapAmount, Content as ZapContent } from '$lib/registry/ui/zap';
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
    {#each exampleZaps as zap (zap.sender.pubkey)}
      <div class="p-3 bg-gray-50 rounded-md flex items-center gap-2">
        <ZapAmount {zap} class="font-bold text-amber-500" /> sats
        {#if zap.comment}
          <ZapContent {zap} class="text-gray-500 text-sm" />
        {/if}
      </div>
    {/each}
  </div>
</div>
