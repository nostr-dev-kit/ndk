<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '../event-card/index.js';
  import { cn } from '../../utils/cn';
  import type {
    UserClickCallback,
    EventClickCallback,
    HashtagClickCallback,
    LinkClickCallback,
    MediaClickCallback
  } from '../../ui/content-renderer/index.svelte.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
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
    onUserClick,
    onEventClick,
    onHashtagClick,
    onLinkClick,
    onMediaClick,
    class: className = ''
  }: Props = $props();

  // Extract text content from event
  const content = $derived(event.content?.trim() || '');
</script>

<EventCard.Root
  data-event-card-compact=""
  {ndk}
  {event}
  {onUserClick}
  {onEventClick}
  {onHashtagClick}
  {onLinkClick}
  {onMediaClick}
  class={cn(
    'p-3 bg-background rounded-md border border-border/50',
    className
  )}
>
  <div class="flex flex-row w-full gap-4">
    <EventCard.Header
      variant="compact"
      showAvatar={true}
      showTimestamp={true}
      avatarSize="sm"
    />
    <EventCard.ReplyIndicator />
  </div>

  <!-- Content - allows wrapping -->
  {#if content}
    <div class="text-sm text-muted-foreground line-clamp-3">
      <EventCard.Content />
    </div>
  {/if}
</EventCard.Root>
