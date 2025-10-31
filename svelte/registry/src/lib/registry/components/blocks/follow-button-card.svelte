<!-- @ndk-version: follow-button-card@0.1.0 -->
<!--
  @component FollowButtonCard
  Large card-style follow button block using createFollowAction builder.
  Prominent design with gradient backgrounds and enhanced visual feedback.
  Great for user profile pages or prominent CTAs.

  @example
  ```svelte
  <FollowButtonCard {ndk} target={user} />
  <FollowButtonCard {ndk} target={user} variant="gradient" />
  <FollowButtonCard {ndk} target={user} showTarget={true} />
  <FollowButtonCard {ndk} target="#bitcoin" showTarget={true} />
  ```
-->
<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { cn } from '../../../utils.js';
  import UserAddIcon from '../../../icons/user-add.svelte';
  import Avatar from '../user-profile/user-profile-avatar.svelte';
  import Name from '../user-profile/user-profile-name.svelte';

  interface Props {
    ndk?: NDKSvelte;
    target: NDKUser | string;
    variant?: 'default' | 'gradient' | 'outline';
    showTarget?: boolean;
    class?: string;
  }

  let {
    ndk: ndkProp,
    target,
    variant = 'default',
    showTarget = false,
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
      'relative group inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all font-semibold text-base overflow-hidden',
      variant === 'default' &&
        !followAction.isFollowing &&
        'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg',
      variant === 'default' &&
        followAction.isFollowing &&
        'bg-card border-2 border-border text-foreground hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20',
      variant === 'gradient' &&
        !followAction.isFollowing &&
        'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg',
      variant === 'gradient' &&
        followAction.isFollowing &&
        'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-foreground hover:from-red-500 hover:to-red-600 hover:text-white',
      variant === 'outline' &&
        !followAction.isFollowing &&
        'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
      variant === 'outline' &&
        followAction.isFollowing &&
        'bg-transparent border-2 border-border text-muted-foreground hover:border-red-500 hover:text-red-500',
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
    <!-- Animated background effect -->
    <span
      class={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        variant !== 'gradient' && 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
      )}
    ></span>

    <!-- Content -->
    <span class="relative flex items-center gap-3">
      {#if showTarget}
        {#if isHashtag}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="flex-shrink-0"
          >
            <path d="M10 3L8 21M16 3L14 21M3 8H21M2 16H20" />
          </svg>
          <span class="inline-flex items-baseline gap-1.5">
            <span class="font-bold">{followAction.isFollowing ? 'Following' : 'Follow'}</span>
            <span class="font-semibold">#{target}</span>
          </span>
        {:else}
          <Avatar {ndk} user={target as NDKUser} size={24} />
          <span class="inline-flex items-baseline gap-1.5">
            <span class="font-bold">{followAction.isFollowing ? 'Following' : 'Follow'}</span>
            <Name {ndk} user={target as NDKUser} size="text-base" class="font-semibold" truncate={false} />
          </span>
        {/if}
      {:else}
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
        {:else if followAction.isFollowing}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
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
          <UserAddIcon size={20} class="flex-shrink-0" />
        {/if}
        <span>{followAction.isFollowing ? 'Following' : 'Follow'}</span>
      {/if}
    </span>
  </button>
{/if}
