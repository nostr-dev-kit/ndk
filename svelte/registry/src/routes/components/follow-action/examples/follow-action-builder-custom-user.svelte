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
        class="px-4 py-2 bg-primary text-primary-foreground border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:opacity-90"
        onclick={onToggle}
      >
        {follow.isFollowing ? '✓ Following' : '+ Follow'}
      </button>
    </div>
  </div>
</UserProfile.Root>
