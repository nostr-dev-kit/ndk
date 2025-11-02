<!-- @ndk-version: user-card-portrait@0.2.0 -->
<!--
  @component UserCardPortrait
  Vertical card layout showing avatar, name, bio, and stats.
  Built using composable UserProfile primitives and FollowButtonPill block.
  Great for grids and profile galleries.

  @example
  ```svelte
  <UserCardPortrait {ndk} {pubkey} />
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../../utils.js';
  import { User } from '../ui/user';
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

<User.Root {ndk} {pubkey}>
  <div class={cn(
    'flex flex-col items-center text-center gap-3 p-6 bg-card border border-border rounded-xl w-80 shrink-0',
    className
  )}>
    <User.Avatar size={96} />
    <div class="flex flex-col items-center gap-1 min-w-0">
      <User.Name field="displayName" size="lg" />
      <User.Field field="name" size="sm" class="text-muted-foreground" />
    </div>
    <User.Field field="about" maxLines={2} class="text-muted-foreground text-sm leading-relaxed" />
    <div class="flex items-center gap-3 text-sm shrink-0">
      <div class="flex flex-col items-center">
        <span class="font-semibold text-foreground">234</span>
        <span class="text-muted-foreground text-xs">notes</span>
      </div>
      <div class="text-muted-foreground">•</div>
      <div class="flex flex-col items-center">
        <span class="font-semibold text-foreground">1.5K</span>
        <span class="text-muted-foreground text-xs">followers</span>
      </div>
    </div>
    <FollowButtonPill {ndk} target={user} variant="solid" />
  </div>
</User.Root>
