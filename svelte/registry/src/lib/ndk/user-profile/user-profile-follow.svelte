<!-- @ndk-version: user-profile@0.11.0 -->
<!--
  @component UserProfile.Follow
  Follow button that uses createFollowAction builder directly.
  Renders different styles based on variant prop.

  @example
  ```svelte
  <UserProfile.Root {ndk} {pubkey}>
    <UserProfile.Follow />
    <UserProfile.Follow variant="primary" />
    <UserProfile.Follow variant="outline" showIcon={false} />
  </UserProfile.Root>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { createFollowAction } from '@nostr-dev-kit/svelte';
  import { USER_PROFILE_CONTEXT_KEY, type UserProfileContext } from './context.svelte.js';
  import { cn } from '$lib/utils';
  import UserAddIcon from '$lib/icons/user-add.svelte';

  interface Props {
    /** Button variant style */
    variant?: 'default' | 'outline' | 'primary';

    /** Show icon in button */
    showIcon?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    variant = 'default',
    showIcon = true,
    class: className = ''
  }: Props = $props();

  const context = getContext<UserProfileContext>(USER_PROFILE_CONTEXT_KEY);

  if (!context) {
    throw new Error('UserProfile.Follow must be used within UserProfile.Root');
  }

  const { ndk, ndkUser } = context;

  if (!ndkUser) {
    throw new Error('UserProfile.Follow requires a valid user in context');
  }

  const isOwnProfile = $derived.by(() => {
    if (!ndk.$currentPubkey) return false;
    try {
      return ndk.$currentPubkey === ndkUser.pubkey;
    } catch {
      return false;
    }
  });

  const followAction = createFollowAction(() => ({ target: ndkUser }), ndk);

  async function handleToggle() {
    if (!ndk.$currentPubkey) return;
    try {
      await followAction.follow();
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  }
</script>

{#if !isOwnProfile && ndk.$currentUser}
  <button
    type="button"
    onclick={handleToggle}
    class={cn(
      variant === 'primary' && followAction.isFollowing && 'px-4 py-2 rounded-full font-medium transition-colors bg-muted text-foreground hover:bg-red-500 hover:text-white text-sm whitespace-nowrap',
      variant === 'primary' && !followAction.isFollowing && 'px-4 py-2 rounded-full font-medium transition-colors bg-accent text-accent-foreground hover:bg-accent/90 text-sm whitespace-nowrap',
      variant !== 'primary' && 'text-sm font-medium transition-colors inline-flex items-center gap-1 whitespace-nowrap',
      variant !== 'primary' && followAction.isFollowing && 'text-muted-foreground hover:text-red-500',
      variant !== 'primary' && !followAction.isFollowing && 'text-primary hover:underline',
      className
    )}
    aria-label={followAction.isFollowing ? 'Unfollow user' : 'Follow user'}
  >
    {#if showIcon}
      {#if followAction.isFollowing}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" />
          <path d="M2 23C2 18.5817 6.47715 15 12 15C17.5228 15 22 18.5817 22 23" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M8 9L10.5 11.5L16 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      {:else}
        <UserAddIcon size={16} />
      {/if}
    {/if}
    {followAction.isFollowing ? 'Unfollow' : 'Follow'}
  </button>
{/if}
