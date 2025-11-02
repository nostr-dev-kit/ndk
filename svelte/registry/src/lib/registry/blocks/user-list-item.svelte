<!-- @ndk-version: user-list-item@0.1.0 -->
<!--
  @component UserListItem
  Compact list item showing user avatar, name, and follow status.
  Perfect for user lists and search results.

  @example
  ```svelte
  <UserListItem {ndk} {pubkey} />
  <UserListItem {ndk} {pubkey} class="hover:bg-accent" />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction } from '@nostr-dev-kit/svelte';
  import { cn } from '../../utils.js';
  import { User } from '../ui/user';

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
