<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';
  import UserAddIcon from '$lib/icons/user-add.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    ndk: NDKSvelte;
    target: NDKUser | string;
    variant?: 'default' | 'outline' | 'primary';
    showIcon?: boolean;
    class?: string;
    children?: Snippet;
    onfollowsuccess?: (e: CustomEvent) => void;
    onfollowerror?: (e: CustomEvent) => void;
  }

  const {
    ndk,
    target,
    variant = 'default',
    showIcon = true,
    class: className = '',
    children
  }: Props = $props();

  // Determine if target is a user or hashtag
  const isHashtag = typeof target === 'string';
  const isOwnProfile = $derived.by(() => {
    if (isHashtag || !ndk.$currentPubkey) return false;
    try {
      return ndk.$currentPubkey === (target as NDKUser).pubkey;
    } catch {
      return false;
    }
  });

  // Create follow action state
  const followAction = createFollowAction(() => ({ target }), ndk);

  // CSS classes based on variant and state
  const buttonClasses = $derived.by(() => {
    if (className) return className;

    if (variant === 'primary') {
      return followAction.isFollowing
        ? 'px-4 py-2 rounded-full font-medium transition-colors bg-muted text-foreground hover:bg-red-500 hover:text-white text-sm'
        : 'px-4 py-2 rounded-full font-medium transition-colors bg-accent text-accent-foreground hover:bg-accent/90 text-sm';
    }

    return `text-sm font-medium transition-colors inline-flex items-center gap-1 ${
      followAction.isFollowing
        ? 'text-muted-foreground hover:text-red-500'
        : 'text-primary hover:underline'
    }`;
  });

  async function handleToggle(event: MouseEvent) {
    if (!ndk.$currentUser) return;

    try {
      await followAction.follow();

      // Dispatch success event
      event.currentTarget?.dispatchEvent(
        new CustomEvent('followsuccess', {
          detail: {
            target,
            isFollowing: followAction.isFollowing,
            isHashtag
          },
          bubbles: true
        })
      );
    } catch (error) {
      console.error('Error toggling follow:', error);

      // Dispatch error event
      event.currentTarget?.dispatchEvent(
        new CustomEvent('followerror', {
          detail: { error, target, isHashtag },
          bubbles: true
        })
      );
    }
  }
</script>

{#if !isOwnProfile && ndk.$currentUser}
  <button
    type="button"
    onclick={handleToggle}
    class={buttonClasses}
    aria-label={followAction.isFollowing
      ? isHashtag
        ? `Unfollow #${target}`
        : 'Unfollow user'
      : isHashtag
        ? `Follow #${target}`
        : 'Follow user'}
  >
    {#if showIcon}
      {#if isHashtag}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="currentColor" fill="none">
          <path d="M10 3L8 21M16 3L14 21M3 8H21M2 16H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      {:else if followAction.isFollowing}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="currentColor" fill="none">
          <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M2 23C2 18.5817 6.47715 15 12 15C17.5228 15 22 18.5817 22 23" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 9L10.5 11.5L16 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      {:else}
        <UserAddIcon size={16} />
      {/if}
    {/if}
    {#if children}
      {@render children()}
    {:else}
      {followAction.isFollowing ? 'Unfollow' : 'Follow'}
    {/if}
  </button>
{/if}
