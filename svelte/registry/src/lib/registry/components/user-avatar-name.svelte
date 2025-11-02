<!--
  @component UserAvatarName
  Opinionated composite component combining User.Avatar and User.Name.

  This is a convenience component for common user display patterns.
  It wraps the User.Root primitive and composites Avatar + Name with optional metadata.

  @example Basic usage:
  ```svelte
  <UserAvatarName {ndk} {user} />
  ```

  @example With metadata:
  ```svelte
  <UserAvatarName {ndk} pubkey={user.pubkey} avatarSize={48} meta="handle" />
  ```
-->
<script lang="ts">
  import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import { User } from '../ui/user';

  interface Props {
    /** NDK instance (required) */
    ndk: NDKSvelte;

    /** User instance */
    user?: NDKUser;

    /** User's pubkey (alternative to user) */
    pubkey?: string;

    /** Pre-loaded profile (optional, avoids fetch) */
    profile?: NDKUserProfile;

    /** Avatar size in pixels */
    avatarSize?: number;

    /** Metadata to show below name: "handle", "about", custom string, or snippet */
    meta?: 'handle' | 'about' | string | Snippet;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    user,
    pubkey,
    profile,
    avatarSize = 40,
    meta,
    onclick,
    class: className = ''
  }: Props = $props();
</script>

<User.Root {ndk} {user} {pubkey} {profile} {onclick}>
  <div class="flex items-center gap-3 {className}">
    <User.Avatar size={avatarSize} />
    {#if meta}
      <div class="flex flex-col">
        <User.Name />
        <div class="text-xs">
          {#if meta === 'handle'}
            <User.Handle />
          {:else if meta === 'about'}
            <User.Bio class="line-clamp-1" />
          {:else if typeof meta === 'string'}
            {meta}
          {:else}
            {@render meta()}
          {/if}
        </div>
      </div>
    {:else}
      <User.Name />
    {/if}
  </div>
</User.Root>
