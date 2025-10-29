<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { createFollowAction } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    user: NDKUser;
    onToggle: () => void;
  }

  let { ndk, user, onToggle }: Props = $props();

  const follow = createFollowAction(() => ({ target: user }), ndk);
</script>

<div class="flex items-center gap-4 p-4 bg-background border border-border rounded-lg">
  <div class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wide">
    {follow.isFollowing ? 'Following' : 'Not Following'}
  </div>
  <button
    class="px-6 py-2 bg-primary text-primary-foreground border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:opacity-90"
    onclick={onToggle}
  >
    {follow.isFollowing ? 'Unfollow' : 'Follow'}
  </button>
</div>
