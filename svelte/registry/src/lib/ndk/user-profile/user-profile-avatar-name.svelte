<!-- @ndk-version: user-profile-avatar-name@0.0.0 -->
<!--
  @component UserProfile.AvatarName
  Pre-styled horizontal layout with avatar and name, with optional metadata below.

  @example Basic usage:
  ```svelte
  <UserProfile.AvatarName {ndk} {pubkey} />
  ```

  @example With handle:
  ```svelte
  <UserProfile.AvatarName {ndk} {pubkey} meta="handle" />
  ```

  @example With bio:
  ```svelte
  <UserProfile.AvatarName {ndk} {pubkey} meta="about" />
  ```

  @example With custom text:
  ```svelte
  <UserProfile.AvatarName {ndk} {pubkey} meta="Software Engineer" />
  ```
-->
<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import Root from './user-profile-root.svelte';
  import Avatar from './user-profile-avatar.svelte';
  import Name from './user-profile-name.svelte';
  import Handle from './user-profile-handle.svelte';
  import Bio from './user-profile-bio.svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** NDK instance (optional, falls back to context) */
    ndk?: NDKSvelte;

    /** User instance */
    user?: NDKUser;

    /** User's pubkey (alternative to user) */
    pubkey?: string;

    /** Avatar size in pixels */
    avatarSize?: number;

    /** Metadata to show below name: "handle", "about", custom string, or snippet */
    meta?: 'handle' | 'about' | string | Snippet;

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
    meta,
    showHoverCard = false,
    onclick,
    class: className = ''
  }: Props = $props();
</script>

<Root ndk={ndk} {user} {pubkey} {showHoverCard} {onclick} class={className}>
  <div class={cn('flex items-center gap-3', className)}>
    <Avatar size={avatarSize} />
    {#if meta}
      <div class="flex flex-col">
        <Name class="font-semibold" />
        <div class="text-sm text-muted-foreground">
          {#if meta === 'handle'}
            <Handle />
          {:else if meta === 'about'}
            <Bio class="line-clamp-1" />
          {:else if typeof meta === 'string'}
            {meta}
          {:else}
            {@render meta()}
          {/if}
        </div>
      </div>
    {:else}
      <Name class="font-semibold" />
    {/if}
  </div>
</Root>
