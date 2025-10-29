<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { createFollowAction } from '@nostr-dev-kit/svelte';
  import { UserProfile } from '$lib/ndk/user-profile';

  interface Props {
    ndk: NDKSvelte;
    user: NDKUser;
    pubkey: string | undefined;
    onToggle: () => void;
  }

  let { ndk, user, pubkey, onToggle }: Props = $props();

  const follow = createFollowAction(() => ({ target: user }), ndk);
</script>

<UserProfile.Root {ndk} {pubkey}>
  <div class="user-display">
    <UserProfile.Avatar size={48} />
    <div class="user-info">
      <UserProfile.Name />
      <button
        class="icon-toggle-btn"
        onclick={onToggle}
        title={follow.isFollowing ? 'Unfollow' : 'Follow'}
      >
        {#if follow.isFollowing}
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        {:else}
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        {/if}
      </button>
    </div>
  </div>
</UserProfile.Root>

<style>
  .user-display {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .icon-toggle-btn {
    width: 2rem;
    height: 2rem;
    padding: 0.375rem;
    background: hsl(var(--color-muted));
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-toggle-btn:hover {
    background: hsl(var(--color-accent));
  }

  .icon-toggle-btn .icon {
    width: 1rem;
    height: 1rem;
  }
</style>
