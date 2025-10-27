<!--
  @component UserProfile.Horizontal
  Pre-styled horizontal layout with avatar and name.

  @example
  ```svelte
  <UserProfile.Horizontal {ndk} {pubkey} />
  <UserProfile.Horizontal {ndk} {pubkey} avatarSize={64} showHandle />
  ```
-->
<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Root from './user-profile-root.svelte';
  import Avatar from './user-profile-avatar.svelte';
  import Name from './user-profile-name.svelte';
  import Handle from './user-profile-handle.svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** User instance */
    user?: NDKUser;

    /** User's pubkey (alternative to user) */
    pubkey?: string;

    /** Avatar size in pixels */
    avatarSize?: number;

    /** Show handle below name */
    showHandle?: boolean;

    /** Show hover card on mouse enter */
    showHoverCard?: boolean;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    user,
    pubkey,
    avatarSize = 40,
    showHandle = false,
    showHoverCard = false,
    onclick,
    class: className = ''
  }: Props = $props();
</script>

<Root {ndk} {user} {pubkey} {showHoverCard} {onclick} class={className}>
  <div class={cn('flex items-center gap-3', className)}>
    <Avatar size={avatarSize} />
    {#if showHandle}
      <div class="flex flex-col">
        <Name class="font-semibold" />
        <Handle class="text-sm text-muted-foreground" />
      </div>
    {:else}
      <Name class="font-semibold" />
    {/if}
  </div>
</Root>
