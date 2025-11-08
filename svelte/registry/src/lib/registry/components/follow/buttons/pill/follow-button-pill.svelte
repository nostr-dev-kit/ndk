<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createFollowAction } from '$lib/registry/builders/follow-action.svelte.js';
  import { getContext } from 'svelte';
  import { cn } from '$lib/registry/utils/cn';
  import HashtagIcon from '$lib/registry/icons/hashtag.svelte';
  import UserAddIcon from '$lib/registry/icons/user-add.svelte';
  import UserFollowingIcon from '$lib/registry/icons/user-following.svelte';
  import { User } from '$lib/registry/ui/user/index.js';

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
  const ndk = ndkProp || ndkContext;

  const isHashtag = typeof target === 'string';
  const targetUser = $derived(!isHashtag ? (target as NDKUser) : undefined);

  const isOwnProfile = $derived.by(() => {
    if (isHashtag || !ndk?.$currentPubkey) return false;
    try {
      return ndk.$currentPubkey === targetUser?.pubkey;
    } catch {
      return false;
    }
  });

  const followAction = createFollowAction(() => ({ target }), ndk);

  const buttonLabel = $derived(followAction.isFollowing ? 'Following' : 'Follow');

  const variantStyles = $derived(
    variant === 'solid'
      ? followAction.isFollowing
        ? 'bg-muted text-foreground hover:bg-primary hover:text-white'
        : 'bg-background border border-border text-foreground hover:bg-background/90'
      : followAction.isFollowing
        ? 'bg-transparent border text-muted-foreground hover:border-border hover:text-foreground'
        : 'bg-transparent border border-border text-foreground hover:bg-background hover:text-foreground'
  );

  const ariaLabel = $derived(
    followAction.isFollowing
      ? isHashtag ? `Unfollow #${target}` : 'Unfollow user'
      : isHashtag ? `Follow #${target}` : 'Follow user'
  );

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
  <div class={compact ? 'inline-block w-10 h-10 relative group' : 'inline-block'}>
    {#if compact}
      <span
        class={cn(
          'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold leading-none transition-opacity duration-300 z-10',
          followAction.isFollowing
            ? 'bg-primary text-primary-foreground opacity-0 group-hover:opacity-100'
            : 'bg-primary text-primary-foreground',
          'shadow-sm pointer-events-none'
        )}
      >
        {followAction.isFollowing ? '−' : '+'}
      </span>
    {/if}
    <button
      data-follow-button-pill=""
      data-following={followAction.isFollowing ? '' : undefined}
      data-target-type={isHashtag ? 'hashtag' : 'user'}
      data-variant={variant}
      data-compact={compact ? '' : undefined}
      type="button"
      onclick={handleToggle}
      class={cn(
        'inline-flex items-center cursor-pointer font-medium text-sm rounded-full',
        compact
          ? showTarget && !isHashtag
            ? 'w-auto h-10 justify-center group overflow-hidden hover:absolute hover:w-auto hover:pr-4 hover:justify-start hover:z-50 transition-all duration-300'
            : 'w-auto h-10 px-3 justify-center group overflow-hidden hover:absolute hover:w-auto hover:pr-4 hover:justify-start hover:z-50 transition-all duration-300'
          : 'gap-2 px-4 py-2 transition-all duration-200',
        variantStyles,
        className
      )}
      aria-label={ariaLabel}
    >
    {#if showTarget && !compact}
      {#if isHashtag}
        <HashtagIcon size={20} class="flex-shrink-0" />
        <span class="inline-flex items-baseline gap-1">
          <span class="font-bold">{buttonLabel}</span>
          <span class="font-normal">#{target}</span>
        </span>
      {:else if targetUser}
        <User.Root {ndk} user={targetUser} class="flex items-center gap-2">
          <User.Avatar class="w-6 h-6" />
          <span class="inline-flex items-baseline gap-1">
            <span class="font-bold">{buttonLabel}</span>
            <User.Name field="displayName" class="text-sm font-normal" />
          </span>
        </User.Root>
      {/if}
    {:else}
      {#if compact && showTarget}
        {#if isHashtag}
          <HashtagIcon size={16} class="flex-shrink-0" />
        {:else if targetUser}
          <div class="w-9 h-9 flex-shrink-0">
            <User.Root {ndk} user={targetUser}>
              <User.Avatar class="w-full h-full" />
            </User.Root>
          </div>
        {/if}
      {:else if showIcon}
        {#if isHashtag}
          <HashtagIcon size={16} class="flex-shrink-0" />
        {:else if followAction.isFollowing}
          <UserFollowingIcon size={16} class="flex-shrink-0" />
        {:else}
          <UserAddIcon size={16} class="flex-shrink-0" />
        {/if}
      {/if}
      {#if !compact}
        <span>{buttonLabel}</span>
      {:else if showTarget}
        <span class="opacity-0 max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out group-hover:opacity-100 group-hover:max-w-[200px] group-hover:pl-2 inline-flex items-baseline gap-1">
          <span class="font-bold">{buttonLabel}</span>
          {#if isHashtag}
            <span class="font-normal">#{target}</span>
          {:else if targetUser}
            <User.Root {ndk} user={targetUser} class="flex items-center gap-2">
              <User.Name field="displayName" class="text-sm font-normal" />
            </User.Root>
          {/if}
        </span>
      {:else}
        <span class="opacity-0 max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out group-hover:opacity-100 group-hover:max-w-[100px] group-hover:pl-2">
          {buttonLabel}
        </span>
      {/if}
    {/if}
    </button>
  </div>
{/if}
