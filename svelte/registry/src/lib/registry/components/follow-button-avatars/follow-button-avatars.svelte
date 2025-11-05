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

  const replyAuthorPubkeys = $derived(Array.from(pubkeySet));
  const totalReplies = $derived(replyAuthorPubkeys.length);

  $effect(() => {
    if (!ndk || !event?.id) return;

    // Fetch replies to this event
    const filter = {
      kinds: [1],
      '#e': [event.id]
    };

    const sub = ndk.subscribe(filter, { closeOnEose: false });

    sub.on('event', (replyEvent) => {
      if (replyEvent.pubkey) {
        pubkeySet.add(replyEvent.pubkey);
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
  aria-label={`${totalReplies} ${totalReplies === 1 ? 'reply' : 'replies'}`}
>
  {#if replyAuthorPubkeys.length > 0}
    <AvatarGroup
      {ndk}
      pubkeys={replyAuthorPubkeys}
      {max}
      size={avatarSize}
      {spacing}
      skipCurrentUser={false}
    />
    {#if showCount && totalReplies > 0}
      <span class="text-sm font-medium text-muted-foreground">
        {totalReplies}
      </span>
    {/if}
  {:else}
    <span class="text-sm text-muted-foreground">No replies</span>
  {/if}
</button>
