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
      {content}
    </div>
  {/if}
</EventCard.Root>
