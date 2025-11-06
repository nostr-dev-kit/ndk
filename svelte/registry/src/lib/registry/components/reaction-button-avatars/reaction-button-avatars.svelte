<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { cn } from '../../utils/cn.js';
  import AvatarGroup from '../avatar-group/avatar-group.svelte';

  interface Props {
    ndk?: NDKSvelte;
    event: NDKEvent;
    variant?: 'ghost' | 'outline' | 'pill' | 'solid';
    emoji?: string;
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
    emoji = '❤️',
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

  const reactionAuthorPubkeys = $derived(Array.from(pubkeySet));
  const totalReactions = $derived(reactionAuthorPubkeys.length);

  $effect(() => {
    if (!ndk || !event?.id) return;

    // Fetch reactions (kind 7) for this event - get ALL reactions, not filtered by emoji
    const filter = {
      kinds: [7],
      '#e': [event.id]
    };

    const sub = ndk.subscribe(filter, { closeOnEose: false });

    sub.on('event', (reactionEvent) => {
      if (reactionEvent.pubkey) {
        pubkeySet.add(reactionEvent.pubkey);
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
  data-reaction-button-avatars=""
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
  aria-label={`${totalReactions} ${totalReactions === 1 ? 'reaction' : 'reactions'}`}
>
  {#if reactionAuthorPubkeys.length > 0}
    {#if emoji === '❤️'}
      <svg
        class="flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        color="currentColor"
        fill="currentColor"
      >
        <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    {:else}
      <span class="text-base leading-none flex-shrink-0">{emoji}</span>
    {/if}

    <AvatarGroup
      {ndk}
      pubkeys={reactionAuthorPubkeys}
      {max}
      size={avatarSize}
      {spacing}
      overflowVariant="none"
      skipCurrentUser={false}
    />
    {#if showCount && totalReactions > 0}
      <span class="text-sm font-medium text-muted-foreground">
        {totalReactions}
      </span>
    {/if}
  {:else}
    {#if emoji === '❤️'}
      <svg
        class="flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        color="currentColor"
        fill="none"
      >
        <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    {:else}
      <span class="text-base leading-none flex-shrink-0">{emoji}</span>
    {/if}
    <span class="text-sm text-muted-foreground">No reactions</span>
  {/if}
</button>
