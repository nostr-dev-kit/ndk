<!-- @ndk-version: user-input@0.4.0 -->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { UserInputResult } from '@nostr-dev-kit/svelte';
  import { USER_INPUT_CONTEXT_KEY, type UserInputContext } from './context.svelte.js';

  interface Props {
    /** Result to display */
    result: UserInputResult;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    result,
    class: className = ''
  }: Props = $props();

  const context = getContext<UserInputContext>(USER_INPUT_CONTEXT_KEY);

  function handleClick() {
    context.selectUser(result.user);
  }

  const displayName = $derived(
    result.profile?.displayName ||
    result.profile?.name ||
    result.user.npub.slice(0, 12) + '...'
  );

  const avatarUrl = $derived(result.profile?.picture || '');
</script>

<button
  type="button"
  class="user-input-result-item {className}"
  onclick={handleClick}
>
  <div class="user-input-result-item-avatar">
    {#if avatarUrl}
      <img src={avatarUrl} alt={displayName} />
    {:else}
      <div class="user-input-result-item-avatar-placeholder">
        {displayName.charAt(0).toUpperCase()}
      </div>
    {/if}
  </div>

  <div class="user-input-result-item-content">
    <div class="user-input-result-item-name">
      {displayName}
      {#if result.isFollowing}
        <span class="user-input-result-item-following-badge">Following</span>
      {/if}
    </div>
    {#if result.profile?.nip05}
      <div class="user-input-result-item-nip05">
        {result.profile.nip05}
      </div>
    {/if}
  </div>
</button>

<style>
  .user-input-result-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .user-input-result-item:hover {
    background-color: hsl(var(--color-accent));
  }

  .user-input-result-item:focus {
    outline: none;
    background-color: hsl(var(--color-accent));
  }

  .user-input-result-item-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    overflow: hidden;
    flex-shrink: 0;
    background-color: hsl(var(--color-muted));
  }

  .user-input-result-item-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-input-result-item-avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: hsl(var(--color-primary));
    color: hsl(var(--primary-foreground));
    font-weight: 600;
    font-size: 1rem;
  }

  .user-input-result-item-content {
    flex: 1;
    min-width: 0;
  }

  .user-input-result-item-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: hsl(var(--color-foreground));
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-input-result-item-following-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    background-color: hsl(var(--color-primary) / 0.1);
    color: hsl(var(--color-primary));
    font-size: 0.75rem;
    font-weight: 500;
    flex-shrink: 0;
  }

  .user-input-result-item-nip05 {
    color: hsl(var(--muted-foreground));
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
