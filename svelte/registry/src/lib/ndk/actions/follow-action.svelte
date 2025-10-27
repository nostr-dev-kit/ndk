<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    ndk: NDKSvelte;
    target: NDKUser | string;
    variant?: 'default' | 'outline' | 'primary';
    showIcon?: boolean;
    class?: string;
  }

  const {
    ndk,
    target,
    variant = 'default',
    showIcon = true,
    class: className = ''
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
  const followAction = createFollowAction(ndk, () => target);

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
      await followAction.toggle();

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
        <!-- Hashtag icon -->
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      {:else if followAction.isFollowing}
        <!-- User minus icon -->
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
          />
        </svg>
      {:else}
        <!-- User plus icon -->
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      {/if}
    {/if}
    <slot>
      {followAction.isFollowing ? 'Unfollow' : 'Follow'}
    </slot>
  </button>
{/if}
