<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { UserInput } from '$lib/registry/ui/user-input';
  import { User } from '$lib/registry/ui/user';

  const ndk = getContext<NDKSvelte>('ndk');

  let selectedUser = $state<NDKUser | null>(null);

  function handleSelect(user: NDKUser) {
    selectedUser = user;
  }
</script>

<div class="custom-user-input-demo">
  {#if selectedUser}
    <div class="selected-display">
      <User.Root {ndk} user={selectedUser}>
        <User.Avatar class="w-8 h-8" />
      </User.Root>
      <div>
        <div class="name">{selectedUser.profile?.name || 'Anonymous'}</div>
        <div class="npub">{selectedUser.npub.slice(0, 16)}...</div>
      </div>
    </div>
  {/if}

  <UserInput.Root {ndk} onSelect={handleSelect}>
    <UserInput.Search placeholder="Search users..." />
    <UserInput.Results>
      {#snippet children(result)}
        <UserInput.Item {result}>
          {#snippet child({ props })}
            <div {...props} class="custom-result-item">
              <User.Root {ndk} user={result.user}>
                <User.Avatar class="w-10 h-10" />
              </User.Root>
              <div class="user-info">
                <div class="user-name">{result.user.profile?.name || 'Anonymous'}</div>
                {#if result.user.profile?.nip05}
                  <div class="nip05">{result.user.profile.nip05}</div>
                {/if}
              </div>
            </div>
          {/snippet}
        </UserInput.Item>
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
