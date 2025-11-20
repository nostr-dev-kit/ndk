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
  import { createBookmarkedRelayList } from '$lib/registry/builders/relay/bookmarks.svelte.js';
  import { Relay } from '$lib/registry/ui/relay';  const relayUrl = 'wss://relay.damus.io';

  // Create bookmarked relay list (includes current user)
  const bookmarks = createBookmarkedRelayList(() => ({
    authors: ndk.$currentUser ? [ndk.$currentUser.pubkey] : []
  }), ndk);
</script>

<div class="border border-gray-200 rounded-xl p-6 bg-white">
  <Relay.Root {ndk} {relayUrl}>
    <div class="flex items-center gap-4 mb-4">
      <Relay.Icon class="w-12 h-12 flex-shrink-0" />
      <div class="flex-1">
        <Relay.Name class="text-lg font-semibold text-gray-900 block mb-1" />
        <Relay.Url class="text-sm text-gray-500 font-mono" />
      </div>
      <Relay.ConnectionStatus showLabel class="text-xs" />
    </div>

    <Relay.Description class="text-[15px] leading-normal text-gray-600 mb-4" />

    <div class="flex justify-end">
      <Relay.BookmarkButton {bookmarks} class="px-4 py-2 rounded-md border border-gray-300 bg-white cursor-pointer transition-all hover:bg-gray-50" />
    </div>
  </Relay.Root>
</div>
