<script lang="ts">
  import { ndk } from '../lib/ndk';
  import Avatar from '../../../../src/lib/components/Avatar.svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';

  interface Props {
    user: NDKUser;
  }

  let { user }: Props = $props();

  let showMenu = $state(false);

  // Fetch user profile
  $effect(() => {
    user.fetchProfile();
  });

  async function handleLogout() {
    // Clear the session
    localStorage.removeItem('nostr-login');
    window.location.reload();
  }

  function handleClickOutside(e: MouseEvent) {
    if (showMenu && !(e.target as Element).closest('.user-menu')) {
      showMenu = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="user-menu">
  <button class="user-btn" onclick={() => (showMenu = !showMenu)} type="button">
    <Avatar pubkey={user.pubkey} size={32} />
    <span class="user-name">{user.profile?.displayName || user.profile?.name || user.npub.slice(0, 8) + '...'}</span>
  </button>

  {#if showMenu}
    <div class="menu-dropdown">
      <div class="profile-header">
        <Avatar pubkey={user.pubkey} size={64} />
        <div class="profile-info">
          <div class="profile-name">{user.profile?.displayName || user.profile?.name || 'Anon'}</div>
          {#if user.profile?.nip05}
            <div class="profile-nip05">✓ {user.profile.nip05}</div>
          {/if}
          {#if user.profile?.about}
            <div class="profile-about">{user.profile.about}</div>
          {/if}
          <div class="profile-npub">{user.npub.slice(0, 16)}...</div>
        </div>
      </div>
      <button class="menu-item logout-btn" onclick={handleLogout} type="button">
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .user-menu {
    position: relative;
  }

  .user-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 9999px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .user-btn:hover {
    border-color: var(--accent-purple);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
  }

  .user-name {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .menu-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    min-width: 300px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    z-index: 1000;
  }

  .profile-header {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
  }

  .profile-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  .profile-name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .profile-nip05 {
    font-size: 0.75rem;
    color: var(--accent-blue);
    font-weight: 500;
  }

  .profile-about {
    font-size: 0.75rem;
    color: var(--text-secondary);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .profile-npub {
    font-size: 0.625rem;
    color: var(--text-tertiary);
    font-family: monospace;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.875rem;
    width: 100%;
    text-align: left;
  }

  .logout-btn {
    cursor: pointer;
    transition: all 0.2s;
  }

  .logout-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
  }
</style>
