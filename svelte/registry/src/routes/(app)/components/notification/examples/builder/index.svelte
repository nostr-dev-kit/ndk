<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk } = $props();
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
  import { createNotificationFeed } from '$lib/registry/builders/notification/index.svelte';
  // Gigi's pubkey for demo
  const targetPubkey = '6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93';

  const feed = createNotificationFeed(() => ({
    pubkey: targetPubkey,
    since: Date.now() / 1000 - 24 * 60 * 60, // Last 24 hours
    sort: 'tag-time' // Most recent interactions first
  }), ndk);
</script>

<div class="space-y-4">
  <div class="p-4 border rounded-lg">
    <h3 class="font-semibold mb-2">Notification Stats</h3>
    <div class="space-y-1 text-sm">
      <div>Total: {feed.count}</div>
      <div>Reactions: {feed.byType.reactions.length}</div>
      <div>Zaps: {feed.byType.zaps.length}</div>
      <div>Reposts: {feed.byType.reposts.length}</div>
      <div>Replies: {feed.byType.replies.length}</div>
    </div>
  </div>

  <div class="space-y-2">
    {#each feed.all.slice(0, 3) as notification}
      <div class="p-3 border rounded">
        <div class="text-sm">
          {notification.actors.length} people interacted
          ({notification.totalCount} interactions)
        </div>
      </div>
    {/each}
  </div>
</div>
