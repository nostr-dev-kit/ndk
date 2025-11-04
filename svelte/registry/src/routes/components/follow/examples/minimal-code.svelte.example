<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { createFollowAction } from '@nostr-dev-kit/svelte';
  import UserAddIcon from '$lib/registry/icons/user-add.svelte';

  interface Props {
    ndk: NDKSvelte;
    target: NDKUser | string;
  }

  let { ndk, target }: Props = $props();

  const followAction = createFollowAction(() => ({ target }), ndk);
</script>

<button
  type="button"
  onclick={followAction.follow}
  class="inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-colors {followAction.isFollowing ? 'text-muted-foreground hover:text-red-500' : 'text-primary'}"
>
  <UserAddIcon size={16} />
  <span class="text-sm font-medium">
    {followAction.isFollowing ? 'Unfollow' : 'Follow'}
  </span>
</button>
