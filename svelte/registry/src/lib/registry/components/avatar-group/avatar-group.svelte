<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createAvatarGroup } from '@nostr-dev-kit/svelte';
  import { User } from '../../ui/user';
  import { cn } from '../../utils/cn.js';

  interface Props {
    ndk: NDKSvelte;

    pubkeys: string[];

    skipCurrentUser?: boolean;

    max?: number;

    size?: number;

    spacing?: 'tight' | 'normal' | 'loose';

    overflowVariant?: 'avatar' | 'text' | 'none';

    direction?: 'horizontal' | 'vertical';

    class?: string;

    onAvatarClick?: (user: NDKUser) => void;

    onOverflowClick?: () => void;

    overflowSnippet?: (count: number) => any;
  }

  let {
    ndk,
    pubkeys = [],
    skipCurrentUser = false,
    max = 5,
    size = 40,
    spacing = 'normal',
    overflowVariant = 'avatar',
    direction = 'horizontal',
    class: className = '',
    onAvatarClick,
    onOverflowClick,
    overflowSnippet
  }: Props = $props();

  // Use the builder to get prioritized user list
  const avatarGroup = createAvatarGroup(() => ({
    pubkeys,
    skipCurrentUser
  }), ndk);

  // Visible avatars and overflow count
  const visibleUsers = $derived(avatarGroup.users.slice(0, max));
  const overflowCount = $derived(Math.max(0, avatarGroup.users.length - max));

  // Spacing values (negative margin for overlap)
  const spacingValues = {
    tight: -8,
    normal: -12,
    loose: -6
  };

  const marginValue = spacingValues[spacing];
  const isVertical = $derived(direction === 'vertical');
</script>

<div
  data-avatar-group=""
  class={cn('avatar-group', 'flex', isVertical ? 'flex-col items-start' : 'items-center', className)}
  role="group"
  aria-label="User avatars"
>
  {#each visibleUsers as user, index (user.pubkey)}
    <div
  data-avatar-group=""
      class="avatar-group-item"
      style:margin-left={!isVertical && index !== 0 ? `${marginValue}px` : '0'}
      style:margin-top={isVertical && index !== 0 ? `${marginValue}px` : '0'}
      style:z-index={visibleUsers.length - index}
    >
      <User.Root {ndk} {user}>
        {#if onAvatarClick}
          <button
            type="button"
            onclick={() => onAvatarClick?.(user)}
            class="avatar-group-button"
            style:width="{size}px"
            style:height="{size}px"
          >
            <User.Avatar
              class="ring-2 ring-background w-full h-full"
            />
          </button>
        {:else}
          <div
  data-avatar-group=""
            class="avatar-wrapper"
            style:width="{size}px"
            style:height="{size}px"
          >
            <User.Avatar
              class="ring-2 ring-background w-full h-full"
            />
          </div>
        {/if}
      </User.Root>
    </div>
  {/each}

  {#if overflowCount > 0 && overflowVariant !== 'none'}
    {#if overflowSnippet}
      {@render overflowSnippet(overflowCount)}
    {:else if overflowVariant === 'text'}
      <div
  data-avatar-group=""
        class="avatar-group-overflow-text"
        style:margin-left={!isVertical ? '8px' : '0'}
        style:margin-top={isVertical ? '8px' : '0'}
      >
        {#if onOverflowClick}
          <button
            type="button"
            onclick={onOverflowClick}
            class="avatar-group-overflow-text-button"
          >
            +{overflowCount}
          </button>
        {:else}
          <span class="avatar-group-overflow-text-content">
            +{overflowCount}
          </span>
        {/if}
      </div>
    {:else}
      <div
  data-avatar-group=""
        class="avatar-group-overflow"
        style:margin-left={!isVertical ? `${marginValue}px` : '0'}
        style:margin-top={isVertical ? `${marginValue}px` : '0'}
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
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 50%;
  }

  .avatar-group-overflow {
    position: relative;
    border-radius: 50%;
    background: var(--muted);
    border: 2px solid var(--background);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: var(--muted-foreground);
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
    color: var(--muted-foreground);
    transition: all 0.2s ease;
  }

  .avatar-group-overflow-button:hover {
    background: var(--muted-hover);
    color: var(--foreground);
    transform: scale(1.1);
  }

  .avatar-group-overflow-button:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .avatar-group-overflow-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-group-overflow-text {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: var(--muted-foreground);
  }

  .avatar-group-overflow-text-content {
    display: inline-block;
  }

  .avatar-group-overflow-text-button {
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    font-weight: 600;
    color: var(--muted-foreground);
    transition: color 0.2s ease;
  }

  .avatar-group-overflow-text-button:hover {
    color: var(--foreground);
  }

  .avatar-group-overflow-text-button:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 4px;
  }
</style>
