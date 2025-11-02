<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { UserInput, User } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  let selectedUser = $state<NDKUser | null>(null);

  function handleSelect(user: NDKUser) {
    selectedUser = user;
  }
</script>

<div class="custom-user-input-demo">
  {#if selectedUser}
    <div class="selected-display">
      <User.Avatar {ndk} user={selectedUser} size={32} />
      <div>
        <div class="name">{selectedUser.profile?.name || 'Anonymous'}</div>
        <div class="npub">{selectedUser.npub.slice(0, 16)}...</div>
      </div>
    </div>
  {/if}

  <UserInput.Root {ndk} onSelect={handleSelect}>
    <UserInput.Search placeholder="Search users..." />
    <UserInput.Results>
      {#snippet resultItem(user)}
        <div class="custom-result-item">
          <User.Avatar {ndk} {user} size={40} />
          <div class="user-info">
            <div class="user-name">{user.profile?.name || 'Anonymous'}</div>
            {#if user.profile?.nip05}
              <div class="nip05">{user.profile.nip05}</div>
            {/if}
          </div>
        </div>
      {/snippet}
    </UserInput.Results>
  </UserInput.Root>
</div>

<style>
  .custom-user-input-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    background: white;
  }

  .selected-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 0.5rem;
    color: white;
  }

  .selected-display .name {
    font-weight: 600;
    font-size: 0.9375rem;
  }

  .selected-display .npub {
    font-size: 0.75rem;
    opacity: 0.9;
    font-family: monospace;
  }

  .custom-result-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .custom-result-item:hover {
    background: #f3f4f6;
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    font-weight: 600;
    font-size: 0.9375rem;
    color: #111827;
  }

  .nip05 {
    font-size: 0.8125rem;
    color: #6b7280;
  }
</style>
