<!--
  @component AvatarGroup
  Displays multiple user avatars in a stacked group with optional overflow count.

  @example
  ```svelte
  <AvatarGroup {ndk} pubkeys={['pubkey1', 'pubkey2', 'pubkey3']} />
  <AvatarGroup {ndk} users={[user1, user2, user3]} max={3} />
  <AvatarGroup {ndk} pubkeys={pubkeys} size={32} spacing="tight" />
  ```
-->
<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Avatar from './user-profile-avatar.svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Array of user pubkeys */
    pubkeys?: string[];

    /** Array of NDKUser instances (alternative to pubkeys) */
    users?: NDKUser[];

    /** Maximum number of avatars to show before overflow */
    max?: number;

    /** Avatar size in pixels */
    size?: number;

    /** Spacing between avatars */
    spacing?: 'tight' | 'normal' | 'loose';

    /** Additional CSS classes */
    class?: string;

    /** Click handler for individual avatars */
    onAvatarClick?: (user: NDKUser) => void;

    /** Click handler for overflow count */
    onOverflowClick?: () => void;
  }

  let {
    ndk,
    pubkeys = [],
    users = [],
    max = 5,
    size = 40,
    spacing = 'normal',
    class: className = '',
    onAvatarClick,
    onOverflowClick
  }: Props = $props();

  // Resolve users from pubkeys or use provided users
  const resolvedUsers = $derived.by(() => {
    if (users.length > 0) return users;
    return pubkeys.map(pubkey => ndk.getUser({ pubkey }));
  });

  // Visible avatars and overflow count
  const visibleUsers = $derived(resolvedUsers.slice(0, max));
  const overflowCount = $derived(Math.max(0, resolvedUsers.length - max));

  // Spacing values (negative margin for overlap)
  const spacingValues = {
    tight: -8,
    normal: -12,
    loose: -6
  };

  const marginLeft = spacingValues[spacing];
</script>

<div
  class={cn('avatar-group', 'flex items-center', className)}
  role="group"
  aria-label="User avatars"
>
  {#each visibleUsers as user, index (user.pubkey)}
    <div
      class="avatar-group-item"
      style:margin-left={index === 0 ? '0' : `${marginLeft}px`}
      style:z-index={visibleUsers.length - index}
    >
      {#if onAvatarClick}
        <button
          type="button"
          onclick={() => onAvatarClick?.(user)}
          class="avatar-group-button"
        >
          <Avatar
            {ndk}
            {user}
            {size}
            class="ring-2 ring-background"
          />
        </button>
      {:else}
        <Avatar
          {ndk}
          {user}
          {size}
          class="ring-2 ring-background"
        />
      {/if}
    </div>
  {/each}

  {#if overflowCount > 0}
    <div
      class="avatar-group-overflow"
      style:margin-left="{marginLeft}px"
      style:width="{size}px"
      style:height="{size}px"
      style:font-size="{size * 0.35}px"
      style:z-index={0}
    >
      {#if onOverflowClick}
        <button
          type="button"
          onclick={onOverflowClick}
          class="avatar-group-overflow-button"
        >
          +{overflowCount}
        </button>
      {:else}
        <div class="avatar-group-overflow-content">
          +{overflowCount}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .avatar-group {
    position: relative;
  }

  .avatar-group-item {
    position: relative;
    transition: transform 0.2s ease;
  }

  .avatar-group-button {
    display: block;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .avatar-group-button:hover {
    transform: scale(1.1);
    z-index: 9999 !important;
  }

  .avatar-group-button:focus-visible {
    outline: 2px solid var(--primary, #3b82f6);
    outline-offset: 2px;
    border-radius: 50%;
  }

  .avatar-group-overflow {
    position: relative;
    border-radius: 50%;
    background: var(--muted, #f3f4f6);
    border: 2px solid var(--background, #ffffff);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: var(--muted-foreground, #6b7280);
    flex-shrink: 0;
  }

  .avatar-group-overflow-button {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: var(--muted-foreground, #6b7280);
    transition: all 0.2s ease;
  }

  .avatar-group-overflow-button:hover {
    background: var(--muted-hover, #e5e7eb);
    color: var(--foreground, #111827);
    transform: scale(1.1);
  }

  .avatar-group-overflow-button:focus-visible {
    outline: 2px solid var(--primary, #3b82f6);
    outline-offset: 2px;
  }

  .avatar-group-overflow-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
