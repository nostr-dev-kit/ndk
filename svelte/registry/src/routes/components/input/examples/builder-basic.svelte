<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createUserInput } from '@nostr-dev-kit/svelte';
  import { UserListItem } from '$lib/registry/components/blocks';

  interface Props {
    ndk: NDKSvelte;
    useRelaySearch: boolean;
    relayUrl: string;
  }

  let { ndk, useRelaySearch, relayUrl }: Props = $props();

  // Local query state
  let query = $state('');

  // Create user input builder with reactive config
  const userInput = createUserInput(() => ({
    query,
    onSelect: (user) => {
      console.log('Selected user:', user);
      // Clear query after selection
      query = '';
    },
    debounceMs: 300,
    relaySearch: useRelaySearch && relayUrl ? [relayUrl] : undefined
  }), ndk);
</script>

<div class="relative max-w-96">
  <div class="relative w-96">
    <input
      type="text"
      bind:value={query}
      placeholder="Search users by name, NIP-05, npub..."
      class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:border-ring"
    />
    {#if userInput.loading}
      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Loading...</span>
    {/if}
  </div>

  {#if userInput.results.length > 0}
    <div class="absolute top-[calc(100%+0.25rem)] left-0 right-0 z-50 max-h-80 overflow-y-auto bg-popover border border-border rounded-md shadow-md">
      {#each userInput.results as result (result.user.pubkey)}
        <button
          type="button"
          class="w-full border-none bg-transparent p-0 cursor-pointer"
          onclick={() => userInput.selectUser(result.user)}
        >
          <UserListItem {ndk} pubkey={result.user.pubkey} class="rounded-none" />
        </button>
      {/each}
    </div>
  {:else if query && !userInput.loading}
    <div class="p-4 text-center text-muted-foreground text-sm">No users found</div>
  {/if}

  {#if userInput.selectedUser}
    <div class="mt-4 p-2 bg-muted rounded-md text-sm">
      Last selected: {userInput.selectedUser.npub.slice(0, 16)}...
    </div>
  {/if}
</div>
