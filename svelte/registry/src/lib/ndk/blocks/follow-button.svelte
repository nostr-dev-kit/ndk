<!-- @ndk-version: follow-button@0.1.0 -->
<!--
  @component FollowButton
  Minimal follow button block using createFollowAction builder.
  Clean, icon-first design with dynamic text based on follow state.

  @example
  ```svelte
  <FollowButton {ndk} target={user} />
  <FollowButton {ndk} target={user} showIcon={false} />
  <FollowButton {ndk} target={user} showTarget={true} />
  <FollowButton {ndk} target="#bitcoin" showTarget={true} />
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
    showIcon?: boolean;
    showTarget?: boolean;
    class?: string;
  }

  let { ndk: ndkProp, target, showIcon = true, showTarget = false, class: className = '' }: Props = $props();

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
      'inline-flex items-center gap-2 p-2 bg-transparent border-none cursor-pointer transition-colors',
      followAction.isFollowing ? 'text-muted-foreground hover:text-red-500' : 'text-primary',
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
    {#if showTarget}
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
        <span class="text-sm inline-flex items-baseline gap-1">
          <span class="font-bold">{followAction.isFollowing ? 'Unfollow' : 'Follow'}</span>
          <span class="font-normal">#{target}</span>
        </span>
      {:else}
        <Avatar {ndk} user={target as NDKUser} size={20} />
        <span class="text-sm inline-flex items-baseline gap-1">
          <span class="font-bold">{followAction.isFollowing ? 'Unfollow' : 'Follow'}</span>
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
      <span class="text-sm font-medium">
        {followAction.isFollowing ? 'Unfollow' : 'Follow'}
      </span>
    {/if}
  </button>
{/if}
