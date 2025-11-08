<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { cn } from '../../utils/cn.js';
  import AvatarGroup from '../avatar-group/avatar-group.svelte';
  import RepostIcon from '../../icons/repost.svelte';

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

  const pubkeySet = new SvelteSet<string>();

  const repostAuthorPubkeys = $derived(Array.from(pubkeySet));
  const totalReposts = $derived(repostAuthorPubkeys.length);

  $effect(() => {
    if (!ndk || !event?.id) return;

    // Fetch reposts (kind 6) and generic reposts (kind 16)
    const filter = {
      kinds: [6, 16],
      '#e': [event.id]
    };

    const sub = ndk.subscribe(filter, { closeOnEose: false });

    sub.on('event', (repostEvent) => {
      if (repostEvent.pubkey) {
        pubkeySet.add(repostEvent.pubkey);
      }
    });

    return () => {
      sub.stop();
    };
  });

  function handleClick() {
    onclick?.();
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
  aria-label={`${totalReposts} ${totalReposts === 1 ? 'repost' : 'reposts'}`}
>
  <RepostIcon size={16} class="flex-shrink-0" />
  {#if repostAuthorPubkeys.length > 0}
    <AvatarGroup
      {ndk}
      pubkeys={repostAuthorPubkeys}
      {max}
      size={avatarSize}
      {spacing}
      overflowVariant="none"
      skipCurrentUser={false}
    />
    {#if showCount && totalReposts > 0}
      <span class="text-sm font-medium text-muted-foreground">
        {totalReposts}
      </span>
    {/if}
  {:else}
    <span class="text-sm text-muted-foreground">No reposts</span>
  {/if}
</button>
