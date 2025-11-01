<!-- @ndk-version: follow-button-animated@0.1.0 -->
<!--
  @component FollowButtonAnimated
  Animated follow button block using svelte-motion for smooth subscribe-style animations.

  @example
  ```svelte
  <FollowButtonAnimated {ndk} target={user} />
  <FollowButtonAnimated {ndk} target={user} showTarget={true} />
  <FollowButtonAnimated {ndk} target="#bitcoin" showTarget={true} />
  ```
-->
<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { Motion } from 'svelte-motion';
  import { cn } from '../../../utils.js';
  import Avatar from '../user-profile/user-profile-avatar.svelte';
  import Name from '../user-profile/user-profile-name.svelte';

  interface Props {
    ndk?: NDKSvelte;
    target: NDKUser | string;
    showTarget?: boolean;
    class?: string;
  }

  let {
    ndk: ndkProp,
    target,
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
  {#if followAction.isFollowing}
    <Motion
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      let:motion
    >
      <button
        type="button"
        onclick={handleToggle}
        class={cn(
          'relative flex w-[200px] items-center justify-center overflow-hidden rounded-md bg-white dark:bg-muted p-[10px]',
          className
        )}
        use:motion
        aria-label={isHashtag ? `Unfollow #${target}` : 'Unfollow user'}
      >
        <Motion initial={{ y: -50 }} animate={{ y: 0 }} let:motion>
          <span
            use:motion
            class="relative flex items-center gap-2 h-full font-semibold text-black dark:text-white"
          >
            {#if showTarget}
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
                <span>Following #{target}</span>
              {:else}
                <Avatar {ndk} user={target as NDKUser} size={16} />
                <span>Following</span>
                <Name {ndk} user={target as NDKUser} size="text-sm" truncate={false} />
              {/if}
            {:else}
              Following
            {/if}
          </span>
        </Motion>
      </button>
    </Motion>
  {:else}
    <Motion
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      let:motion
    >
      <button
        type="button"
        onclick={handleToggle}
        class={cn(
          'relative flex w-[200px] cursor-pointer items-center justify-center rounded-md border-none p-[10px] bg-primary text-primary-foreground',
          className
        )}
        use:motion
        aria-label={isHashtag ? `Follow #${target}` : 'Follow user'}
      >
        <Motion
          initial={{ x: 0 }}
          exit={{ x: 50, transition: { duration: 0.1 } }}
          let:motion
        >
          <span use:motion class="relative flex items-center gap-2 font-semibold">
            {#if showTarget}
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
                <span>Follow #{target}</span>
              {:else}
                <Avatar {ndk} user={target as NDKUser} size={16} />
                <span>Follow</span>
                <Name {ndk} user={target as NDKUser} size="text-sm" truncate={false} />
              {/if}
            {:else}
              Follow
            {/if}
          </span>
        </Motion>
      </button>
    </Motion>
  {/if}
{/if}
