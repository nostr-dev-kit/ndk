<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { createTimeAgo } from '../../utils/time-ago';
  import { User } from '../../ui/user';
  import { Event } from '../../ui/event';
  import { cn } from '../../utils/cn';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    class?: string;
  }

  let { ndk, event, class: className = '' }: Props = $props();

  // Fetch author profile
  const profileFetcher = createProfileFetcher(() => ({ user: event.author }), ndk);

  // Create reactive time ago string
  const timeAgo = createTimeAgo(event.created_at);

  // Extract text content from event
  const content = $derived(event.content?.trim() || '');
</script>

<article
  data-event-card-compact=""
  class={cn(
    'flex flex-col gap-2 p-3 bg-background rounded-md border border-border/50',
    className
  )}
>
    <div class="flex flex-row w-full gap-4">
  <User.Root {ndk} user={event.author} profile={profileFetcher.profile ?? undefined}>
    <!-- Header: Avatar, name, and timestamp -->
    <div class="flex items-center gap-2">
      <User.Avatar class="w-8 h-8 flex-shrink-0" />

      <div class="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        <User.Name
          field="displayName"
          class="font-semibold text-foreground truncate"
        />
        <span class="text-muted-foreground flex-shrink-0">·</span>
        <time
          datetime={new Date(event.created_at * 1000).toISOString()}
          class="text-muted-foreground flex-shrink-0"
        >
          {timeAgo}
        </time>
      </div>
    </div>
  </User.Root>

  <Event.ReplyIndicator {ndk} {event} />
  </div>

  <!-- Content - allows wrapping -->
  {#if content}
    <div class="text-sm text-muted-foreground line-clamp-3">
      {content}
    </div>
  {/if}
</article>
