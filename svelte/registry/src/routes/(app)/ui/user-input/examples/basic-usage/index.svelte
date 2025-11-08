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

<div class="user-input-demo">
  {#if selectedUser}
    <div class="selected-user">
      <strong>Selected:</strong> {selectedUser.profile?.name || selectedUser.npub}
    </div>
  {/if}

  <UserInput.Root {ndk} onSelect={handleSelect}>
    <UserInput.Search placeholder="Search by name, NIP-05, or npub..." />
    <UserInput.Results>
      {#snippet children(result)}
        <UserInput.Item {result}>
          <!-- Default rendering - UserListItem will be used in a real example -->
          <span>{result.user.profile?.name || result.user.npub}</span>
        </UserInput.Item>
      {/snippet}
    </UserInput.Results>
  </UserInput.Root>
</div>

<style>
  .user-input-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    background: white;
  }

  .selected-user {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #f3f4f6;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .selected-user strong {
    font-weight: 600;
  }
</style>
