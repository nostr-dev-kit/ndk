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
        class="custom-follow-btn"
        onclick={onToggle}
      >
        {follow.isFollowing ? '✓ Following' : '+ Follow'}
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

  .custom-follow-btn {
    padding: 0.5rem 1rem;
    background: hsl(var(--color-primary));
    color: hsl(var(--color-primary-foreground));
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .custom-follow-btn:hover {
    opacity: 0.9;
  }
</style>
