<!-- @ndk-version: event-card@0.20.0 -->
<!--
  @component EventCard.Header
  Minimal header builder showing avatar, name, and timestamp.
  Use EventCardMenu block for dropdown functionality.

  @example Basic usage:
  ```svelte
  <EventCard.Header />
  ```

  @example With custom actions:
  ```svelte
  <EventCard.Header>
    <EventCardMenu {ndk} {event} />
  </EventCard.Header>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import Avatar from '../../ui/user/user-avatar.svelte';
  import Name from '../../ui/user/user-name.svelte';
  import Field from '../../ui/user/user-field.svelte';
  import Nip05 from '../../ui/user/user-nip05.svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './context.svelte.js';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { cn } from '../../../utils.js';
  import { createTimeAgo } from '../../utils/time-ago.svelte.js';
  import { User } from '../../ui/user';
  import type { Snippet } from 'svelte';

  interface Props {
    /** Display variant */
    variant?: 'full' | 'compact' | 'minimal';

    /** Show author avatar */
    showAvatar?: boolean;

    /** Show timestamp */
    showTimestamp?: boolean;

    /** Avatar size */
    avatarSize?: 'sm' | 'md' | 'lg';

    /** Additional CSS classes */
    class?: string;

    /** Custom actions (e.g., EventCardMenu) */
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
  class={cn(
    'flex items-center gap-3',
    className
  )}
>
  <!-- Avatar and Author Info -->
  <div class="flex items-center gap-3 flex-1 min-w-0" onclick={stopPropagation}>
    {#if showAvatar}
      <Avatar
        ndk={context.ndk}
        user={context.event.author}
        profile={profileFetcher.profile}
        size={avatarSize === 'sm' ? 32 : avatarSize === 'md' ? 40 : 48}
        class="flex-shrink-0"
      />
    {/if}

    <div class="flex-1 min-w-0">
      {#if variant === 'full'}
        <!-- Full variant: name on top, handle below -->
        <div class="flex flex-col">
          <Name
            ndk={context.ndk}
            user={context.event.author}
            profile={profileFetcher.profile}
            field="displayName"
            class="font-semibold text-[15px] text-foreground truncate"
          />
          <Field
            ndk={context.ndk}
            user={context.event.author}
            profile={profileFetcher.profile}
            field="nip05"
            class="text-sm text-muted-foreground truncate"
          />
        </div>
      {:else if variant === 'compact'}
        <!-- Compact: name and handle inline -->
        <div class="flex items-center gap-2 min-w-0">
          <User.Root user={context.event.author}>
            <Name
              ndk={context.ndk}
              user={context.event.author}
              profile={profileFetcher.profile}
              field="displayName"
              class="font-semibold text-[15px] text-foreground truncate"
            />
          </User.Root>
        </div>
      {:else}
        <!-- Minimal: just name -->
        <Name
          ndk={context.ndk}
          user={context.event.author}
          profile={profileFetcher.profile}
          field="displayName"
          class="font-semibold text-[15px] text-foreground truncate"
        />
      {/if}
    </div>
  </div>

  <!-- Timestamp and Custom Actions -->
  <div class="flex items-center gap-3">
    {#if showTimestamp}
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