<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { UserInput } from '../index.js';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

  let selectedUser = $state<NDKUser | null>(null);

  function handleSelect(user: NDKUser) {
    selectedUser = user;
  }

  function clearSelection() {
    selectedUser = null;
  }
</script>

<div class="example-container">
  {#if selectedUser}
    <div class="selected-user-card">
      <div class="selected-user-info">
        <div class="avatar">
          {#if selectedUser.profile?.picture}
            <img src={selectedUser.profile.picture} alt="" />
          {:else}
            <div class="avatar-placeholder">
              {(selectedUser.profile?.displayName || selectedUser.profile?.name || 'U').charAt(0).toUpperCase()}
            </div>
          {/if}
        </div>
        <div class="info">
          <div class="name">
            {selectedUser.profile?.displayName || selectedUser.profile?.name || 'Unknown User'}
          </div>
          {#if selectedUser.profile?.nip05}
            <div class="nip05">{selectedUser.profile.nip05}</div>
          {/if}
        </div>
      </div>
      <button
        type="button"
        class="clear-button"
        onclick={clearSelection}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  {:else}
    <UserInput.Root {ndk} onSelect={handleSelect}>
      <UserInput.Search placeholder="Search for a user..." autofocus />

      <UserInput.Results maxResults={8}>
        {#snippet children(result)}
          <UserInput.ResultItem {result} />
        {/snippet}
      </UserInput.Results>
    </UserInput.Root>
  {/if}
</div>

<style>
  .example-container {
    max-width: 24rem;
  }

  .selected-user-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
    background-color: hsl(var(--card));
  }

  .selected-user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .avatar {
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    overflow: hidden;
    background-color: hsl(var(--muted));
    flex-shrink: 0;
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
    font-size: 1.25rem;
  }

  .info {
    flex: 1;
    min-width: 0;
  }

  .name {
    font-weight: 600;
    color: hsl(var(--foreground));
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nip05 {
    color: hsl(var(--muted-foreground));
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .clear-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: 1px solid hsl(var(--border));
    border-radius: 0.375rem;
    background-color: transparent;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .clear-button:hover {
    background-color: hsl(var(--destructive) / 0.1);
    border-color: hsl(var(--destructive));
    color: hsl(var(--destructive));
  }
</style>
