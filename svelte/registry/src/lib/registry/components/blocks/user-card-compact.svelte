<!-- @ndk-version: user-card-compact@0.2.0 -->
<!--
  @component UserCardCompact
  Minimal user card for lists, showing avatar, name, and follow button.
  Built using composable UserProfile primitives and FollowButton block.
  Ideal for sidebars and compact layouts.

  @example
  ```svelte
  <UserCardCompact {ndk} {pubkey} />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../../../utils.js';
  import { UserProfile } from '../user-profile';
  import FollowButton from './follow-button.svelte';

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
</script>

<UserProfile.Root {ndk} {pubkey}>
  <div class={cn(
    'flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted w-full',
    className
  )}>
    <UserProfile.Avatar size={48} />
    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
      <UserProfile.Name field="displayName" size="md" truncate={true} />
      <UserProfile.Field field="name" size="sm" />
    </div>
    <FollowButton {ndk} target={user} class="shrink-0" />
  </div>
</UserProfile.Root>
