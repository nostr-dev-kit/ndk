<script lang="ts">
  import { createFollowAction } from '@nostr-dev-kit/svelte';

  let { ndk, user } = $props();

  // Use createFollowAction builder directly
  const followAction = createFollowAction(() => ({ target: user }), ndk);
</script>

<button
  type="button"
  onclick={() => followAction.follow()}
  class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
>
  {followAction.isFollowing ? 'Following' : 'Follow'}
</button>
