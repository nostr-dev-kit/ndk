<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '../event-card/index.js';
  import ReplyButton from '../reply-button/reply-button.svelte';
  import ReactionButton from '../reaction-button/reaction-button.svelte';
  import RepostButton from '../repost-button/repost-button.svelte';
  import ZapButton from '../zap-button/zap-button.svelte';
  import ReplyButtonAvatars from '../reply-button-avatars/reply-button-avatars.svelte';
  import ReactionButtonAvatars from '../reaction-button-avatars/reaction-button-avatars.svelte';
  import RepostButtonAvatars from '../repost-button-avatars/repost-button-avatars.svelte';
  import ZapButtonAvatars from '../zap-button-avatars/zap-button-avatars.svelte';
  import { cn } from '../../utils/cn';
  import type { ReplyIntentCallback } from '../../builders/reply-action/index.js';
  import type { QuoteIntentCallback } from '../../builders/repost-action/index.js';
  import type { ZapIntentCallback } from '../../builders/zap-action/index.js';

  interface Props {
    ndk: NDKSvelte;

    event: NDKEvent;

    truncate?: number;

    withAvatars?: boolean;

    onReplyIntent?: ReplyIntentCallback;

    onQuoteIntent?: QuoteIntentCallback;

    onZapIntent?: ZapIntentCallback;

    class?: string;
  }

  let {
    ndk,
    event,
    truncate,
    withAvatars = false,
    onReplyIntent,
    onQuoteIntent,
    onZapIntent,
    class: className = ''
  }: Props = $props();
</script>

<EventCard.Root
    data-event-card-basic=""
  {ndk}
  {event}
  class={cn(
    'p-4 bg-background',
    'hover:bg-muted/50 transition-colors',
    className
  )}
>
  <div class="flex items-start justify-between gap-2">
    <EventCard.Header />
    <EventCard.Dropdown />
  </div>

  <EventCard.Content {truncate} class="wrap-break-word" />

  <EventCard.Actions>
    {#if withAvatars}
      <ReplyButtonAvatars {ndk} {event} onlyFollows={true} onclick={() => onReplyIntent?.(event)} />
      <RepostButtonAvatars {ndk} {event} onlyFollows={true} onquote={() => onQuoteIntent?.(event)} />
      <ReactionButtonAvatars {ndk} {event} onlyFollows={true} />
      <ZapButtonAvatars {ndk} {event} onlyFollows={true} onclick={(zapFn) => onZapIntent?.(event, zapFn)} />
    {:else}
      <ReplyButton {ndk} {event} onclick={() => onReplyIntent?.(event)} />
      <RepostButton {ndk} {event} onquote={() => onQuoteIntent?.(event)} />
      <ReactionButton {ndk} {event} />
      <ZapButton {ndk} {event} onclick={(zapFn) => onZapIntent?.(event, zapFn)} />
    {/if}
  </EventCard.Actions>
</EventCard.Root>