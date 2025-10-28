<script lang="ts">
  import { getContext } from 'svelte';
  import Avatar from '$lib/ndk/user-profile/user-profile-avatar.svelte';
  import Name from '$lib/ndk/user-profile/user-profile-name.svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './context.svelte.js';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** Display variant */
    variant?: 'full' | 'compact' | 'minimal';

    /** Show author avatar */
    showAvatar?: boolean;

    /** Show timestamp */
    showTimestamp?: boolean;

    /** Show options menu */
    showMenu?: boolean;

    /** Avatar size */
    avatarSize?: 'sm' | 'md' | 'lg';

    /** Additional CSS classes */
    class?: string;
  }

  let {
    variant = 'full',
    showAvatar = true,
    showTimestamp = true,
    showMenu = false,
    avatarSize = 'md',
    class: className = ''
  }: Props = $props();

  const context = getContext<EventCardContext>(EVENT_CARD_CONTEXT_KEY);

  // Fetch author profile directly
  const profileFetcher = createProfileFetcher({ ndk: context.ndk, user: () => context.event.author });

  // Format timestamp
  const timestamp = $derived.by(() => {
    if (!context.event.created_at) return '';

    const date = new Date(context.event.created_at * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 1) return 'now';
      return `${mins}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (hours < 168) { // 7 days
      const days = Math.floor(hours / 24);
      return `${days}d`;
    } else {
      // Show date for older posts
      return date.toLocaleDateString();
    }
  });

  // Stop propagation on interactive elements
  function stopPropagation(e: Event) {
    e.stopPropagation();
  }
</script>

<header
  class={cn(
    'event-card-header',
    'flex items-center gap-3 p-4',
    'border-b',
    className
  )}
  style="border-bottom-color: #f0f0f0;"
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
          <Name
            ndk={context.ndk}
            user={context.event.author}
            profile={profileFetcher.profile}
            field="name"
            class="text-sm text-muted-foreground truncate"
          />
        </div>
      {:else if variant === 'compact'}
        <!-- Compact: name and handle inline -->
        <div class="flex items-center gap-2 min-w-0">
          <Name
            ndk={context.ndk}
            user={context.event.author}
            profile={profileFetcher.profile}
            field="displayName"
            class="font-semibold text-[15px] text-foreground truncate"
          />
          <Name
            ndk={context.ndk}
            user={context.event.author}
            profile={profileFetcher.profile}
            field="name"
            class="text-sm text-muted-foreground truncate"
          />
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

  <!-- Timestamp and Menu -->
  <div class="flex items-center gap-3">
    {#if showTimestamp && timestamp}
      <time
        datetime={new Date(context.event.created_at! * 1000).toISOString()}
        class="text-sm text-muted-foreground/70"
      >
        {timestamp}
      </time>
    {/if}

    {#if showMenu}
      <button
        onclick={stopPropagation}
        class="p-1 rounded hover:bg-muted transition-colors"
        aria-label="More options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="text-muted-foreground/70"
        >
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
    {/if}
  </div>
</header>

<style>
  .event-card-header {
    /* Prevent text selection when card is interactive */
    user-select: none;
  }
</style>