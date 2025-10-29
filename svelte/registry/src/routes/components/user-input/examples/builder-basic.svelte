<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createUserInput } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

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
    debounceMs: 300
  }), ndk);
</script>

<div class="relative max-w-96">
  <div class="relative">
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
          class="flex items-center gap-3 w-full p-3 border-none bg-transparent text-left cursor-pointer hover:bg-accent"
          onclick={() => userInput.selectUser(result.user)}
        >
          <div class="w-10 h-10 rounded-full overflow-hidden bg-muted">
            {#if result.profile?.picture}
              <img src={result.profile.picture} alt="" class="w-full h-full object-cover" />
            {:else}
              <div class="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-semibold">
                {(result.profile?.displayName || result.profile?.name || 'U').charAt(0).toUpperCase()}
              </div>
            {/if}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 font-medium text-foreground text-sm">
              {result.profile?.displayName || result.profile?.name || result.user.npub.slice(0, 12) + '...'}
              {#if result.isFollowing}
                <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">Following</span>
              {/if}
            </div>
            {#if result.profile?.nip05}
              <div class="text-muted-foreground text-xs">{result.profile.nip05}</div>
            {/if}
          </div>
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
