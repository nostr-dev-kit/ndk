<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction } from '$lib/registry/builders/follow-action.svelte.js';
  import { getContext } from 'svelte';
  import { Motion } from 'svelte-motion';
  import { cn } from '$lib/registry/utils/cn';
  import { User } from '../../../ui/user/index.js';

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
  const ndk = ndkProp || ndkContext;

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
        data-follow-button-animated=""
        data-following=""
        data-target-type={isHashtag ? 'hashtag' : 'user'}
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
                  <path d="M10 3L8 21M16 3L14 21M3 8H21M2 16H20" ></path>
                </svg>
                <span>Following #{target}</span>
              {:else}
                <User.Root {ndk} user={target as NDKUser} class="flex items-center gap-2">
                  <User.Avatar class="w-4 h-4" />
                  <span>Following</span>
                  <User.Name field="displayName" class="text-sm" />
                </User.Root>
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
        data-follow-button-animated=""
        data-target-type={isHashtag ? 'hashtag' : 'user'}
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
                  <path d="M10 3L8 21M16 3L14 21M3 8H21M2 16H20" ></path>
                </svg>
                <span>Follow #{target}</span>
              {:else}
                <User.Root {ndk} user={target as NDKUser} class="flex items-center gap-2">
                  <User.Avatar class="w-4 h-4" />
                  <span>Follow</span>
                  <User.Name field="displayName" class="text-sm" />
                </User.Root>
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
