<script lang="ts">
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createAvatarGroup } from '$lib/registry/builders/avatar-group/index.svelte.js';
  import { User } from '../../ui/user';
  import { cn } from '../../utils/cn.js';

  interface Props {
    ndk: NDKSvelte;

    pubkeys: string[];

    skipCurrentUser?: boolean;

    max?: number;

    size?: number;

    spacing?: 'tight' | 'normal' | 'loose';

    overflowVariant?: 'avatar' | 'text' | 'none';

    direction?: 'horizontal' | 'vertical';

    class?: string;

    onAvatarClick?: (user: NDKUser) => void;

    onOverflowClick?: () => void;

    overflowSnippet?: (count: number) => any;
  }

  let {
    ndk,
    pubkeys = [],
    skipCurrentUser = false,
    max = 5,
    size = 40,
    spacing = 'normal',
    overflowVariant = 'avatar',
    direction = 'horizontal',
    class: className = '',
    onAvatarClick,
    onOverflowClick,
    overflowSnippet
  }: Props = $props();

  // Use the builder to get prioritized user list
  const avatarGroup = createAvatarGroup(() => ({
    pubkeys,
    skipCurrentUser
  }), ndk);

  // Visible avatars and overflow count
  const visibleUsers = $derived(avatarGroup.users.slice(0, max));
  const overflowCount = $derived(Math.max(0, avatarGroup.users.length - max));

  // Spacing values (negative margin for overlap)
  const spacingValues = {
    tight: -8,
    normal: -12,
    loose: -6
  };

  const marginValue = spacingValues[spacing];
  const isVertical = $derived(direction === 'vertical');
</script>

<div
  data-avatar-group=""
  class={cn('relative flex', isVertical ? 'flex-col items-start' : 'items-center', className)}
  role="group"
  aria-label="User avatars"
>
  {#each visibleUsers as user, index (user.pubkey)}
    <div
      data-avatar-group=""
      class="relative transition-transform duration-200"
      style:margin-left={!isVertical && index !== 0 ? `${marginValue}px` : '0'}
      style:margin-top={isVertical && index !== 0 ? `${marginValue}px` : '0'}
      style:z-index={visibleUsers.length - index}
    >
      <User.Root {ndk} {user}>
        {#if onAvatarClick}
          <button
            type="button"
            onclick={() => onAvatarClick?.(user)}
            class="block p-0 border-none bg-none cursor-pointer transition-transform duration-200 hover:scale-110 hover:!z-[9999] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:rounded-full"
            style:width="{size}px"
            style:height="{size}px"
          >
            <User.Avatar
              class="ring-2 ring-background w-full h-full"
            />
          </button>
        {:else}
          <div
            data-avatar-group=""
            class="avatar-wrapper"
            style:width="{size}px"
            style:height="{size}px"
          >
            <User.Avatar
              class="ring-2 ring-background w-full h-full"
            />
          </div>
        {/if}
      </User.Root>
    </div>
  {/each}

  {#if overflowCount > 0 && overflowVariant !== 'none'}
    {#if overflowSnippet}
      {@render overflowSnippet(overflowCount)}
    {:else if overflowVariant === 'text'}
      <div
        data-avatar-group=""
        class="flex items-center font-semibold text-muted-foreground"
        style:margin-left={!isVertical ? '8px' : '0'}
        style:margin-top={isVertical ? '8px' : '0'}
      >
        {#if onOverflowClick}
          <button
            type="button"
            onclick={onOverflowClick}
            class="p-0 border-none bg-none cursor-pointer font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:rounded"
          >
            +{overflowCount}
          </button>
        {:else}
          <span class="inline-block">
            +{overflowCount}
          </span>
        {/if}
      </div>
    {:else}
      <div
        data-avatar-group=""
        class="relative rounded-full bg-muted border-2 border-background flex items-center justify-center font-semibold text-muted-foreground flex-shrink-0"
        style:margin-left={!isVertical ? `${marginValue}px` : '0'}
        style:margin-top={isVertical ? `${marginValue}px` : '0'}
        style:width="{size}px"
        style:height="{size}px"
        style:font-size="{size * 0.35}px"
        style:z-index={0}
      >
        {#if onOverflowClick}
          <button
            type="button"
            onclick={onOverflowClick}
            class="w-full h-full rounded-full border-none bg-none cursor-pointer flex items-center justify-center font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted-hover hover:text-foreground hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            +{overflowCount}
          </button>
        {:else}
          <div class="w-full h-full flex items-center justify-center">
            +{overflowCount}
          </div>
        {/if}
      </div>
    {/if}
  {/if}
</div>
