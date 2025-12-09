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
  import * as NotificationItem from '$lib/registry/ui/notification';
  const targetPubkey = '6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93';

  const feed = createNotificationFeed(() => ({
    pubkey: targetPubkey,
    since: Date.now() / 1000 - 24 * 60 * 60,
    limit: 5
  }), ndk);
</script>

{#snippet actorCount({ count }: { pubkeys: string[]; count: number })}
  <span class="text-xs text-muted-foreground">
    {count} {count === 1 ? 'person' : 'people'}
  </span>
{/snippet}

<div class="space-y-4">
  {#each feed.all as notification}
    <NotificationItem.Root {ndk} {notification}>
      <!-- Custom layout using primitives -->
      <div class="border rounded-lg p-4 space-y-3">
        <div class="flex items-center justify-between">
          <NotificationItem.Action />
          <NotificationItem.Timestamp />
        </div>

        <NotificationItem.Content class="text-sm text-muted-foreground" />

        <div class="flex items-center gap-3 pt-3 border-t">
          <NotificationItem.Actors max={5} size={28} spacing="tight" />
          <NotificationItem.Actors snippet={actorCount} />
        </div>
      </div>
    </NotificationItem.Root>
  {/each}
</div>
