<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction } from '@nostr-dev-kit/svelte';
  import { cn } from '../../utils/index.js';
  import { User } from '../../ui/user';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** User's pubkey */
    pubkey: string;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    pubkey,
    class: className = ''
  }: Props = $props();

  const user = $derived(ndk.getUser({ pubkey }));
  const followAction = createFollowAction(() => ({ target: user }), ndk);
</script>

<User.Root {ndk} {pubkey}>
  <div class={cn(
    'flex items-center gap-3 py-3 px-4 border-b border-border transition-colors hover:bg-muted/50 w-full',
    className
  )}>
    <User.Avatar class="w-10 h-10" />
    <div class="flex-1 min-w-0 flex items-center gap-2">
      <User.Name field="displayName" class="truncate" />
    </div>
    {#if followAction.isFollowing && ndk.$currentUser}
      <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex-shrink-0">
        Following
      </span>
    {/if}
  </div>
</User.Root>
