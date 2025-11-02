<script lang="ts">
  import { createFollowAction } from '@nostr-dev-kit/svelte';

  const user = $derived(ndk.getUser({ pubkey }));
  const followAction = createFollowAction(() => ({ target: user }), ndk);
</script>

<User.Root {ndk} {pubkey}>
  <div class="flex items-center gap-3 py-3 px-4 border-b border-border transition-colors hover:bg-muted/50 w-full">
    <User.Avatar size={40} />
    <div class="flex-1 min-w-0 flex items-center gap-2">
      <User.Name field="displayName" size="sm" truncate={true} />
      {#if followAction.isFollowing && ndk.$currentUser}
        <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0">
          Following
        </span>
      {/if}
    </div>
  </div>
</User.Root>
