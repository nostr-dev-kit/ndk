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
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { UserInput } from '$lib/registry/ui/user-input';
    import UserProfile from '$lib/registry/components/user-profile/user-profile.svelte';
  let selectedUser = $state<NDKUser | null>(null);

  function handleSelect(user: NDKUser) {
    selectedUser = user;
  }
</script>

<div class="">
  {#if selectedUser}
    <div class="mb-4 p-3 bg-muted rounded-md text-sm">
      <UserProfile {ndk} user={selectedUser} variant="compact" />
    </div>
  {/if}

  <UserInput.Root {ndk} onSelect={handleSelect} class="flex flex-col gap-4">
    <div class="bg-background p-2 rounded-lg flex flex-col">
      <UserInput.Search placeholder="Search by name, NIP-05, or npub..." class="w-48 px-3 py-2 focus:ring-none focus:outline-0" />
      <UserInput.Results class="mt-2 -mx-2 w-92 h-48 overflow-hidden flex flex-col items-stretch">
        {#snippet children(result)}
        <UserInput.Item {result} class="px-3 py-2 hover:bg-muted cursor-pointer last:border-b-0">
          <UserProfile {ndk} user={result.user} class="text-sm font-medium text-foreground truncate" size="xs" />
        </UserInput.Item>
        {/snippet}
      </UserInput.Results>
    </div>
    </UserInput.Root>
</div>
