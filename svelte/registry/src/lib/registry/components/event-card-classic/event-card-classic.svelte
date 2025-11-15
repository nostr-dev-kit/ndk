<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '../event-card/index.js';
  import ReplyButton from '../reply-button/reply-button.svelte';
  import ReactionButton from '../reaction-button/reaction-button.svelte';
  import RepostButton from '../repost-button/repost-button.svelte';
  import ZapButton from '../zap-button/zap-button.svelte';
  import { cn } from '../../utils/cn';
  import type { ReplyIntentCallback } from '../../builders/reply-action/index.js';
  import type { QuoteIntentCallback } from '../../builders/repost-action/index.js';
  import type { ZapIntentCallback } from '../../builders/zap-action/index.js';
  import type {
    UserClickCallback,
    EventClickCallback,
    HashtagClickCallback,
    LinkClickCallback,
    MediaClickCallback
  } from '../../ui/content-renderer/index.svelte.js';
    import EventCardReplyIndicator from '../event-card/event-card-reply-indicator.svelte';

  interface Props {
    ndk: NDKSvelte;

    event: NDKEvent;

    truncate?: number;

    onReplyIntent?: ReplyIntentCallback;

    onQuoteIntent?: QuoteIntentCallback;

    onZapIntent?: ZapIntentCallback;

    onUserClick?: UserClickCallback;

    onEventClick?: EventClickCallback;

    onHashtagClick?: HashtagClickCallback;

    onLinkClick?: LinkClickCallback;

    onMediaClick?: MediaClickCallback;

    class?: string;
  }

  let {
    ndk,
    event,
    truncate,
    onReplyIntent,
    onQuoteIntent,
    onZapIntent,
    onUserClick,
    onEventClick,
    onHashtagClick,
    onLinkClick,
    onMediaClick,
    class: className = ''
  }: Props = $props();
</script>

<EventCard.Root
    data-event-card-classic=""
  {ndk}
  {event}
  {onUserClick}
  {onEventClick}
  {onHashtagClick}
  {onLinkClick}
  {onMediaClick}
  class={cn(
    'p-4 rounded-lg border border-border bg-card w-full',
    'hover:bg-accent/50 transition-colors',
    className
  )}
>
  <div class="flex items-start justify-between gap-2">
    <EventCard.Header />
    <EventCard.Dropdown />
  </div>
  <EventCard.ReplyIndicator />

  <EventCard.Content {truncate} class="wrap-break-word" />

  <EventCard.Actions>
    <ReplyButton {ndk} {event} onclick={() => onReplyIntent?.(event)} />
    <RepostButton {ndk} {event} onquote={() => onQuoteIntent?.(event)} />
    <ReactionButton {ndk} {event} />
    <ZapButton {ndk} {event} onclick={(zapFn) => onZapIntent?.(event, zapFn)} />
  </EventCard.Actions>
</EventCard.Root>
