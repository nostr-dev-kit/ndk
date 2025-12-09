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
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import type { NDKFollowPack } from '@nostr-dev-kit/ndk';
  import { FollowPack } from '$lib/registry/ui/follow-pack';
  // Example follow pack (you would normally get this from an event)
  let followPack = $state<NDKFollowPack | null>(null);
</script>

<div class="border border-gray-200 rounded-lg p-4 bg-white">
  {#if followPack}
    <FollowPack.Root {ndk} {followPack}>
      <div class="p-4 bg-gray-50 rounded-lg">
        <FollowPack.Title class="text-lg font-semibold text-gray-900" />
        <FollowPack.Description class="text-sm text-gray-500 mt-2" />
        <FollowPack.MemberCount class="text-xs text-gray-400 mt-2" format="long" />
      </div>
    </FollowPack.Root>
  {:else}
    <div class="p-8 text-center text-gray-500">
      <p>Load a follow pack event to see details</p>
    </div>
  {/if}
</div>
