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
  import { UserProfile } from '$lib/registry/components/user/displays/profile';
  import { User } from '$lib/registry/ui/user';

  const ndk = getContext<NDKSvelte>('ndk');

  let selectedUser = $state<NDKUser | null>(null);

  function handleSelect(user: NDKUser) {
    selectedUser = user;
  }
</script>

<div class="border border-border rounded-xl p-6 bg-card">
  {#if selectedUser}
    <div class="mb-4 p-4 bg-primary rounded-lg text-primary-foreground">
      <UserProfile {ndk} user={selectedUser} size="sm" byline={selectedUser.npub.slice(0, 16) + '...'} />
    </div>
  {/if}

  <UserInput.Root {ndk} onSelect={handleSelect}>
    <UserInput.Search placeholder="Search users..." />
    <UserInput.Results>
      {#snippet children(result)}
        <UserInput.Item {result}>
          {#snippet child({ props })}
            <div {...props} class="p-3 rounded-md cursor-pointer transition-colors hover:bg-muted">
              <UserProfile {ndk} user={result.user} byline={result.user.profile?.nip05} />
            </div>
          {/snippet}
        </UserInput.Item>
      {/snippet}
    </UserInput.Results>
  </UserInput.Root>
</div>
