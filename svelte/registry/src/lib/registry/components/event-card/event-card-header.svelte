<script lang="ts">
  import { getContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './event-card.context.js';
  import { ENTITY_CLICK_CONTEXT_KEY, type EntityClickContext } from '../../ui/entity-click-context.js';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { cn } from '../../utils/cn';
  import { createTimeAgo } from '../../utils/time-ago';
  import { User } from '../../ui/user';
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

  const entityClickContext = getContext<EntityClickContext | undefined>(ENTITY_CLICK_CONTEXT_KEY);

  // Fetch author profile directly
  const profileFetcher = createProfileFetcher(() => ({ user: context.event.author }), context.ndk);

  // Create reactive time ago string
  const timeAgo = createTimeAgo(context.event.created_at);

  // Handle user click
  function handleUserClick(e: Event) {
    if (entityClickContext?.onUserClick) {
      e.stopPropagation();
      entityClickContext.onUserClick(context.event.pubkey);
    }
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
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      class={cn(
        'flex items-center gap-3 flex-1 min-w-0',
        entityClickContext?.onUserClick && 'cursor-pointer'
      )}
      onclick={handleUserClick}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleUserClick(e);
        }
      }}
      role={entityClickContext?.onUserClick ? "button" : "presentation"}
      tabindex={entityClickContext?.onUserClick ? 0 : undefined}
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