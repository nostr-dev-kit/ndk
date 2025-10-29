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

<div class="example-container">
  <div class="input-wrapper">
    <input
      type="text"
      bind:value={query}
      placeholder="Search users by name, NIP-05, npub..."
      class="search-input"
    />
    {#if userInput.loading}
      <span class="loading-indicator">Loading...</span>
    {/if}
  </div>

  {#if userInput.results.length > 0}
    <div class="results-list">
      {#each userInput.results as result (result.user.pubkey)}
        <button
          type="button"
          class="result-item"
          onclick={() => userInput.selectUser(result.user)}
        >
          <div class="avatar">
            {#if result.profile?.picture}
              <img src={result.profile.picture} alt="" />
            {:else}
              <div class="avatar-placeholder">
                {(result.profile?.displayName || result.profile?.name || 'U').charAt(0).toUpperCase()}
              </div>
            {/if}
          </div>
          <div class="user-info">
            <div class="name">
              {result.profile?.displayName || result.profile?.name || result.user.npub.slice(0, 12) + '...'}
              {#if result.isFollowing}
                <span class="badge">Following</span>
              {/if}
            </div>
            {#if result.profile?.nip05}
              <div class="nip05">{result.profile.nip05}</div>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  {:else if query && !userInput.loading}
    <div class="no-results">No users found</div>
  {/if}

  {#if userInput.selectedUser}
    <div class="selected">
      Last selected: {userInput.selectedUser.npub.slice(0, 16)}...
    </div>
  {/if}
</div>

<style>
  .example-container {
    position: relative;
    max-width: 24rem;
  }

  .input-wrapper {
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid hsl(var(--border));
    border-radius: 0.375rem;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-size: 0.875rem;
  }

  .search-input:focus {
    outline: none;
    border-color: hsl(var(--ring));
  }

  .loading-indicator {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground));
  }

  .results-list {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    right: 0;
    z-index: 50;
    max-height: 20rem;
    overflow-y: auto;
    background-color: hsl(var(--popover));
    border: 1px solid hsl(var(--border));
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .result-item:hover {
    background-color: hsl(var(--accent));
  }

  .avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    overflow: hidden;
    background-color: hsl(var(--muted));
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    font-weight: 600;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: hsl(var(--foreground));
    font-size: 0.875rem;
  }

  .badge {
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    background-color: hsl(var(--primary) / 0.1);
    color: hsl(var(--primary));
    font-size: 0.75rem;
  }

  .nip05 {
    color: hsl(var(--muted-foreground));
    font-size: 0.75rem;
  }

  .no-results {
    padding: 1rem;
    text-align: center;
    color: hsl(var(--muted-foreground));
    font-size: 0.875rem;
  }

  .selected {
    margin-top: 1rem;
    padding: 0.5rem;
    background-color: hsl(var(--muted));
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
</style>
