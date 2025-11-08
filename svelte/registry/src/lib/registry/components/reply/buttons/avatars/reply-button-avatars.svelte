<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { NDKKind, eventIsReply } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { getContext } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { cn } from '$lib/registry/utils/cn';
  import AvatarGroup from '$lib/registry/components/misc/avatar-group/avatar-group.svelte';
  import ReplyIcon from '$lib/registry/icons/reply.svelte';

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

    // Fetch replies (kind 1 Text and kind 1111 GenericReply)
    const filter = {
      kinds: [NDKKind.Text, NDKKind.GenericReply],
      ...event.filter()
    };

    const sub = ndk.subscribe(filter, { closeOnEose: false });

    sub.on('event', (replyEvent) => {
      // Use NDK's built-in eventIsReply to verify it's actually a reply
      if (eventIsReply(event, replyEvent) && replyEvent.pubkey) {
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
  data-reply-button-avatars=""
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
  aria-label={`${totalReplies} ${totalReplies === 1 ? 'reply' : 'replies'}`}
>
  <ReplyIcon size={16} class="flex-shrink-0" />
  {#if replyAuthorPubkeys.length > 0}
    <AvatarGroup
      {ndk}
      pubkeys={replyAuthorPubkeys}
      {max}
      size={avatarSize}
      {spacing}
      overflowVariant="none"
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
