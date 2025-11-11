<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createRepostAction } from '../../builders/repost-action/index.svelte.js';
  import { getContext } from 'svelte';
  import { tv } from 'tailwind-variants';
  import AvatarGroup from '../avatar-group/avatar-group.svelte';
  import RepostIcon from '../../icons/repost/repost.svelte';

  interface Props {
    ndk?: NDKSvelte;
    event: NDKEvent;
    variant?: 'ghost' | 'outline' | 'pill' | 'solid';
    max?: number;
    avatarSize?: number;
    spacing?: 'tight' | 'normal' | 'loose';
    showCount?: boolean;
    onlyFollows?: boolean;
    onclick?: () => void;
    class?: string;
  }

  let {
    ndk: ndkProp,
    event,
    variant = 'ghost',
    max = 3,
    avatarSize = 24,
    spacing = 'tight',
    showCount = true,
    onlyFollows = true,
    onclick,
    class: className = ''
  }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;

  const repostAction = createRepostAction(() => ({ event }), ndk);

  const buttonStyles = tv({
    base: 'inline-flex items-center gap-2 cursor-pointer font-medium text-sm transition-all rounded-md outline-none disabled:pointer-events-none disabled:opacity-50',
    variants: {
      variant: {
        ghost: 'px-3 py-2 hover:bg-accent hover:text-accent-foreground',
        outline: 'px-3 py-2 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border border-border',
        pill: 'px-4 py-2 bg-background shadow-xs hover:bg-accent hover:text-accent-foreground border border-border rounded-full',
        solid: 'px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90'
      }
    }
  });

  async function handleClick() {
    if (onclick) {
      onclick();
    } else {
      if (!ndk?.$currentPubkey) return;
      try {
        await repostAction.repost();
      } catch (error) {
        console.error('Failed to repost:', error);
      }
    }
  }
</script>

<button
  data-repost-button-avatars=""
  data-variant={variant}
  type="button"
  onclick={handleClick}
  class={buttonStyles({ variant, class: className })}
  aria-label={`${repostAction.count} ${repostAction.count === 1 ? 'repost' : 'reposts'}`}
>
  <RepostIcon size={16} class="flex-shrink-0" />
  {#if repostAction.pubkeys.length > 0}
    <AvatarGroup
      {ndk}
      pubkeys={repostAction.pubkeys}
      {max}
      size={avatarSize}
      {spacing}
      overflowVariant="none"
      skipCurrentUser={false}
      {onlyFollows}
    />
    {#if showCount && repostAction.count > 0}
      <span class="text-sm font-medium text-muted-foreground">
        {repostAction.count}
      </span>
    {/if}
  {/if}
</button>
