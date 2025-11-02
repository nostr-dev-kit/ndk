<!-- @ndk-version: follow-button-pill@0.2.0 -->
<!--
  @component FollowButtonPill
  Pill-style follow button block using createFollowAction builder.
  Rounded button with background, border, and smooth hover/active states.

  @example
  ```svelte
  <FollowButtonPill {ndk} target={user} />
  <FollowButtonPill {ndk} target={user} variant="outline" />
  <FollowButtonPill {ndk} target={user} compact />
  <FollowButtonPill {ndk} target={user} showTarget={true} />
  <FollowButtonPill {ndk} target="#bitcoin" showTarget={true} />
  ```
-->
<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '../../../utils.js';
  import UserAddIcon from '../../../icons/user-add.svelte';
  import Avatar from '../../ui/user/user-avatar.svelte';
  import Name from '../../ui/user/user-name.svelte';

  interface Props {
    ndk?: NDKSvelte;
    target: NDKUser | string;
    variant?: 'solid' | 'outline';
    showIcon?: boolean;
    showTarget?: boolean;
    compact?: boolean;
    class?: string;
  }

  let {
    ndk: ndkProp,
    target,
    variant = 'solid',
    showIcon = true,
    showTarget = false,
    compact = false,
    class: className = ''
  }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = $derived(ndkProp || ndkContext);

  const isHashtag = typeof target === 'string';
  const isOwnProfile = $derived.by(() => {
    if (isHashtag || !ndk?.$currentPubkey) return false;
    try {
      return ndk.$currentPubkey === (target as NDKUser).pubkey;
    } catch {
      return false;
    }
  });

  const followAction = createFollowAction(() => ({ target }), ndk);

  async function handleToggle() {
    if (!ndk?.$currentPubkey) return;
    try {
      await followAction.follow();
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  }
</script>

{#if !isOwnProfile && ndk?.$currentUser}
  <div class={compact ? 'inline-block w-10 h-10 relative' : 'inline-block'}>
    <button
      type="button"
      onclick={handleToggle}
      class={cn(
        'inline-flex items-center cursor-pointer transition-all font-medium text-sm rounded-full',
        compact
          ? 'w-10 h-10 px-3 group overflow-hidden hover:absolute hover:w-auto hover:pr-4 hover:z-50'
          : 'gap-2 px-4 py-2',
        variant === 'solid' &&
          !followAction.isFollowing &&
          'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'solid' &&
          followAction.isFollowing &&
          'bg-muted text-foreground hover:bg-red-500 hover:text-white',
        variant === 'outline' &&
          !followAction.isFollowing &&
          'bg-transparent border border-primary text-primary hover:bg-primary hover:text-primary-foreground',
        variant === 'outline' &&
          followAction.isFollowing &&
          'bg-transparent border border-border text-muted-foreground hover:border-red-500 hover:text-red-500',
        className
      )}
      aria-label={followAction.isFollowing
        ? isHashtag
          ? `Unfollow #${target}`
          : 'Unfollow user'
        : isHashtag
          ? `Follow #${target}`
          : 'Follow user'}
    >
    {#if showTarget && !compact}
      {#if isHashtag}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="flex-shrink-0"
        >
          <path d="M10 3L8 21M16 3L14 21M3 8H21M2 16H20" />
        </svg>
        <span class="inline-flex items-baseline gap-1">
          <span class="font-bold">{followAction.isFollowing ? 'Following' : 'Follow'}</span>
          <span class="font-normal">#{target}</span>
        </span>
      {:else}
        <Avatar {ndk} user={target as NDKUser} size={20} />
        <span class="inline-flex items-baseline gap-1">
          <span class="font-bold">{followAction.isFollowing ? 'Following' : 'Follow'}</span>
          <Name {ndk} user={target as NDKUser} size="text-sm" class="font-normal" truncate={false} />
        </span>
      {/if}
    {:else}
      {#if compact && showTarget}
        <!-- Compact with target shows avatar/hashtag icon -->
        {#if isHashtag}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="flex-shrink-0"
          >
            <path d="M10 3L8 21M16 3L14 21M3 8H21M2 16H20" />
          </svg>
        {:else}
          <Avatar {ndk} user={target as NDKUser} size={16} class="flex-shrink-0" />
        {/if}
      {:else if showIcon}
        <!-- Regular icons -->
        {#if isHashtag}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="flex-shrink-0"
          >
            <path d="M10 3L8 21M16 3L14 21M3 8H21M2 16H20" />
          </svg>
        {:else if followAction.isFollowing}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="flex-shrink-0"
          >
            <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" />
            <path d="M2 23C2 18.5817 6.47715 15 12 15C17.5228 15 22 18.5817 22 23" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 9L10.5 11.5L16 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        {:else}
          <UserAddIcon size={16} class="flex-shrink-0" />
        {/if}
      {/if}
      {#if !compact}
        <span>{followAction.isFollowing ? 'Following' : 'Follow'}</span>
      {:else if showTarget}
        <!-- Compact with target name/hashtag -->
        <span class="opacity-0 max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out group-hover:opacity-100 group-hover:max-w-[200px] ml-2 inline-flex items-baseline gap-1">
          <span class="font-bold">{followAction.isFollowing ? 'Following' : 'Follow'}</span>
          {#if isHashtag}
            <span class="font-normal">#{target}</span>
          {:else}
            <Name {ndk} user={target as NDKUser} size="text-sm" class="font-normal" truncate={false} />
          {/if}
        </span>
      {:else}
        <!-- Compact without target -->
        <span class="opacity-0 max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out group-hover:opacity-100 group-hover:max-w-[100px] ml-2">
          {followAction.isFollowing ? 'Following' : 'Follow'}
        </span>
      {/if}
    {/if}
    </button>
  </div>
{/if}
