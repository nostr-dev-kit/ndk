<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard } from '../event-card/index.js';
  import { cn } from '../../utils/cn';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    onUserClick?: (pubkey: string) => void;
    onEventClick?: (event: NDKEvent) => void;
    onHashtagClick?: (tag: string) => void;
    onLinkClick?: (url: string) => void;
    onMediaClick?: (url: string | string[]) => void;
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
  data-event-card-inline=""
  {ndk}
  {event}
  {onUserClick}
  {onEventClick}
  {onHashtagClick}
  {onLinkClick}
  {onMediaClick}
  class={cn(
    'px-3 py-2 bg-muted/30 rounded-md border border-border/50',
    'hover:bg-muted/50 transition-colors',
    className
  )}
>
  <EventCard.ReplyIndicator class="text-xs" />

  <div class="flex items-center gap-2">
    <EventCard.Header
      variant="minimal"
      showAvatar={true}
      showTimestamp={true}
      avatarSize="sm"
    />

    <!-- Content - truncated to one line -->
    {#if content}
      <div class="min-w-0 text-sm text-muted-foreground truncate break-word w-96">
        {content}
      </div>
    {/if}
  </div>
</EventCard.Root>
