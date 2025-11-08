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
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { UserInput } from '$lib/registry/ui/user-input';

  const ndk = getContext<NDKSvelte>('ndk');

  let selectedUser = $state<NDKUser | null>(null);

  function handleSelect(user: NDKUser) {
    selectedUser = user;
  }
</script>

<div class="border border-border rounded-lg p-4 bg-card">
  {#if selectedUser}
    <div class="mb-4 p-3 bg-muted rounded-md text-sm">
      <strong class="font-semibold">Selected:</strong> {selectedUser.profile?.name || selectedUser.npub}
    </div>
  {/if}

  <UserInput.Root {ndk} onSelect={handleSelect}>
    <UserInput.Search placeholder="Search by name, NIP-05, or npub..." class="w-full px-3 py-2 border border-border rounded-md bg-background" />
    <UserInput.Results class="mt-2 border border-border rounded-md bg-card overflow-hidden">
      {#snippet children(result)}
        <UserInput.Item {result} class="px-3 py-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0">
          <div class="text-sm font-medium text-foreground truncate">
            {result.user.profile?.name || result.user.npub}
          </div>
        </UserInput.Item>
      {/snippet}
    </UserInput.Results>
  </UserInput.Root>
</div>
