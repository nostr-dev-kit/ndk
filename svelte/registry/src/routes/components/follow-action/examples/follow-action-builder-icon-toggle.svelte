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
  <div class="flex items-center gap-4">
    <UserProfile.Avatar size={48} />
    <div class="flex flex-col gap-2">
      <UserProfile.Name />
      <button
        class="w-8 h-8 p-1.5 bg-muted border-none rounded-full cursor-pointer transition-all flex items-center justify-center hover:bg-accent"
        onclick={onToggle}
        title={follow.isFollowing ? 'Unfollow' : 'Follow'}
      >
        {#if follow.isFollowing}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        {:else}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
