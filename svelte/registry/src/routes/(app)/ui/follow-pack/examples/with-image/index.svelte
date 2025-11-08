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
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
  import { FollowPack } from '$lib/registry/ui/follow-pack';

  const ndk = getContext<NDKSvelte>('ndk');

  let followPack = $state<NDKFollowPack | null>(null);
</script>

<div class="border border-gray-200 rounded-xl p-6 bg-white">
  {#if followPack}
    <FollowPack.Root {ndk} {followPack}>
      <div class="flex flex-col gap-4 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <FollowPack.Image class="w-full h-40 object-cover" />
        <div class="p-4">
          <FollowPack.Title class="text-xl font-bold text-gray-900 mb-2" />
          <FollowPack.Description class="text-sm text-gray-500 leading-normal" />
          <div class="mt-4 pt-4 border-t border-gray-200">
            <FollowPack.MemberCount format="short" class="text-[13px] text-gray-500 font-medium" />
          </div>
        </div>
      </div>
    </FollowPack.Root>
  {:else}
    <div class="p-8 text-center text-gray-500">
      <p>Load a follow pack with image to see the card</p>
    </div>
  {/if}
</div>
