<!-- @ndk-version: user-card-landscape@0.2.0 -->
<!--
  @component UserCardLandscape
  Horizontal card layout with avatar on left.
  Built using composable UserProfile primitives and FollowButtonPill block.
  Perfect for feed views and detailed lists.

  @example
  ```svelte
  <UserCardLandscape {ndk} {pubkey} />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../../../utils.js';
  import { UserProfile } from '../user-profile';
  import FollowButtonPill from './follow-button-pill.svelte';

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
    'flex gap-4 p-6 bg-card border border-border rounded-xl min-w-96',
    className
  )}>
    <UserProfile.Avatar size={64} />
    <div class="flex-1 flex flex-col gap-3 min-w-0">
      <div class="flex items-start gap-4">
        <div class="flex flex-col gap-1 items-start flex-1 min-w-0">
          <UserProfile.Name field="displayName" size="lg" />
          <UserProfile.Field field="name" size="sm" class="text-muted-foreground" />
        </div>
        <FollowButtonPill {ndk} target={user} variant="solid" class="shrink-0" />
      </div>
      <UserProfile.Field field="about" maxLines={2} class="text-muted-foreground text-sm leading-relaxed" />
    </div>
  </div>
</UserProfile.Root>
