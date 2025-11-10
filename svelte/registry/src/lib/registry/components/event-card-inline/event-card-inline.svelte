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
  data-event-card-inline=""
  class={cn(
    'flex flex-col gap-1 px-3 py-2 bg-muted/30 rounded-md border border-border/50',
    'hover:bg-muted/50 transition-colors',
    className
  )}
>
  <Event.ReplyIndicator {ndk} {event} class="text-xs" />

  <div class="flex items-center gap-2">
    <User.Root {ndk} user={event.author} profile={profileFetcher.profile ?? undefined}>
      <!-- Avatar -->
      <User.Avatar class="w-6 h-6 flex-shrink-0" />

      <!-- User info: name, handle, and timestamp on same line -->
      <div class="flex items-center gap-1.5 text-sm flex-shrink-0">
        <User.Name
          field="displayName"
          class="font-semibold text-foreground"
        />
        <span class="text-muted-foreground">·</span>
        <time
          datetime={new Date(event.created_at * 1000).toISOString()}
          class="text-muted-foreground"
        >
          {timeAgo}
        </time>
      </div>
    </User.Root>

    <!-- Content - truncated to one line -->
    {#if content}
      <div class="min-w-0 text-sm text-muted-foreground truncate break-word w-96">
        {content}
      </div>
    {/if}
  </div>
</article>
