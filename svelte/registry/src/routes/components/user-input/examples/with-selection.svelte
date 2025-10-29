<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { UserInput } from '$lib/ndk/user-input/index.js';

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


