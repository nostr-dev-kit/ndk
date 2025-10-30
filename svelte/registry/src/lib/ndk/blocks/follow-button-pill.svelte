<!-- @ndk-version: follow-button-pill@0.1.0 -->
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
  import { cn } from '$lib/utils';
  import UserAddIcon from '$lib/icons/user-add.svelte';
  import Avatar from '../user-profile/user-profile-avatar.svelte';
  import Name from '../user-profile/user-profile-name.svelte';

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
  <button
    type="button"
    onclick={handleToggle}
    class={cn(
      'inline-flex items-center cursor-pointer transition-all font-medium text-sm rounded-full',
      compact ? 'p-2 relative group overflow-visible' : 'gap-2 px-4 py-2',
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
      {#if showIcon}
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
      {:else}
        <!-- Hover label for compact mode -->
        <span
          class={cn(
            'absolute left-full ml-2 px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none',
            'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0',
            'transition-all duration-300 ease-out z-50',
            variant === 'solid' &&
              !followAction.isFollowing &&
              'bg-primary text-primary-foreground shadow-md',
            variant === 'solid' &&
              followAction.isFollowing &&
              'bg-muted text-foreground shadow-md',
            variant === 'outline' &&
              !followAction.isFollowing &&
              'bg-primary text-primary-foreground shadow-md',
            variant === 'outline' &&
              followAction.isFollowing &&
              'bg-card border border-border text-foreground shadow-md'
          )}
        >
          {followAction.isFollowing ? 'Following' : 'Follow'}
        </span>
      {/if}
    {/if}
  </button>
{/if}
