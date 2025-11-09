<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createRepostAction } from '../../builders/repost-action/index.svelte.js';
  import { getContext } from 'svelte';
  import { cn } from '../../utils/cn';
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
    onclick,
    class: className = ''
  }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = ndkProp || ndkContext;

  const repostAction = createRepostAction(() => ({ event }), ndk);

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
  class={cn(
    'inline-flex items-center gap-2 cursor-pointer transition-all',
    variant === 'ghost' && 'p-2 bg-transparent border-none hover:bg-accent',
    variant === 'outline' && 'px-3 py-2 bg-transparent border border-border rounded-md hover:bg-accent',
    variant === 'pill' && 'px-4 py-2 bg-transparent border border-border rounded-full hover:bg-accent',
    variant === 'solid' && 'px-4 py-2 bg-muted border border-border rounded-md hover:bg-accent',
    className
  )}
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
    />
    {#if showCount && repostAction.count > 0}
      <span class="text-sm font-medium text-muted-foreground">
        {repostAction.count}
      </span>
    {/if}
  {:else}
    <span class="text-sm text-muted-foreground">No reposts</span>
  {/if}
</button>
