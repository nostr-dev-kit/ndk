<script lang="ts">
  import { getContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './event-card.context.js';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { cn } from '../../../utils/cn.js';
  import { createTimeAgo } from '../../../utils/time-ago.svelte.js';
  import { User } from '../../../ui/user';
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'full' | 'compact' | 'minimal';

    showAvatar?: boolean;

    showTimestamp?: boolean;

    avatarSize?: 'sm' | 'md' | 'lg';

    class?: string;

    children?: Snippet;
  }

  let {
    variant = 'full',
    showAvatar = true,
    showTimestamp = true,
    avatarSize = 'md',
    class: className = '',
    children
  }: Props = $props();

  const context = getContext<EventCardContext>(EVENT_CARD_CONTEXT_KEY);
  if (!context) {
    throw new Error('EventCard.Header must be used within EventCard.Root');
  }

  // Fetch author profile directly
  const profileFetcher = createProfileFetcher(() => ({ user: context.event.author }), context.ndk);

  // Create reactive time ago string
  const timeAgo = createTimeAgo(context.event.created_at);

  // Stop propagation on interactive elements
  function stopPropagation(e: Event) {
    e.stopPropagation();
  }
</script>

<header
  data-event-card-header=""
  data-variant={variant}
  class={cn(
    'flex items-center gap-3',
    className
  )}
>
  <!-- Avatar and Author Info -->
  <User.Root ndk={context.ndk} user={context.event.author} profile={profileFetcher.profile ?? undefined}>
    <div
      class="flex items-center gap-3 flex-1 min-w-0"
      onclick={stopPropagation}
      onkeydown={(e) => e.stopPropagation()}
      role="presentation"
    >
      {#if showAvatar}
        <User.Avatar
          class={cn(
            'flex-shrink-0',
            avatarSize === 'sm' ? 'w-6 h-6' : avatarSize === 'md' ? 'w-10 h-10' : 'w-12 h-12'
          )}
        />
      {/if}

      <div class="flex-1 min-w-0">
        {#if variant === 'full'}
          <!-- Full variant: name on top, handle below -->
          <div class="flex flex-col">
            <User.Name
              field="displayName"
              class="font-semibold text-[15px] text-foreground truncate"
            />
            <User.Nip05
              class="text-sm text-muted-foreground truncate"
            />
          </div>
        {:else if variant === 'compact'}
          <!-- Compact: name and handle inline -->
          <div class="flex items-center gap-2 min-w-0">
            <User.Name
              field="displayName"
              class="font-semibold text-[15px] text-foreground truncate"
            />
          </div>
        {:else}
          <!-- Minimal: just name -->
          <User.Name
            field="displayName"
            class="font-semibold text-[15px] text-foreground truncate"
          />
        {/if}
      </div>
    </div>
  </User.Root>

  <!-- Timestamp and Custom Actions -->
  <div class="flex items-center gap-3">
    {#if showTimestamp && context.event.created_at}
      <time
        datetime={new Date(context.event.created_at * 1000).toISOString()}
        class="text-sm text-muted-foreground/70"
      >
        {timeAgo}
      </time>
    {/if}

    {#if children}
      {@render children()}
    {/if}
  </div>
</header>