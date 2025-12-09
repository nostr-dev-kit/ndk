<script lang="ts">
  import { getContext } from 'svelte';
  import { EVENT_CARD_CONTEXT_KEY, type EventCardContext } from './event-card.context.js';
  import { CONTENT_RENDERER_CONTEXT_KEY, type ContentRendererContext } from '../../ui/content-renderer/content-renderer.context.js';
  import { cn } from '../../utils/cn';
  import { User } from '../../ui/user';
  import { Event } from '../../ui/event';
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'full' | 'compact' | 'minimal';

    showAvatar?: boolean;

    showTimestamp?: boolean;

    avatarSize?: 'xs' | 'sm' | 'md' | 'lg';

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

  const rendererContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);

  // Handle user click
  function handleUserClick(e: Event) {
    if (rendererContext?.renderer.onUserClick && context.event.author) {
      e.stopPropagation();
      rendererContext.renderer.onUserClick(context.event.author);
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
  <User.Root ndk={context.ndk} user={context.event.author}>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      class={cn(
        'flex items-center gap-3 flex-1 min-w-0',
        rendererContext?.renderer.onUserClick && 'cursor-pointer'
      )}
      onclick={handleUserClick}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleUserClick(e);
        }
      }}
      role={rendererContext?.renderer.onUserClick ? "button" : "presentation"}
      tabindex={rendererContext?.renderer.onUserClick ? 0 : undefined}
    >
      {#if showAvatar}
        <User.Avatar
          class={cn(
            'flex-shrink-0',
            avatarSize === 'xs' ? 'w-4 h-4' : avatarSize == 'sm' ? 'w-6 h-6' : avatarSize === 'md' ? 'w-10 h-10' : 'w-12 h-12'
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
      <Event.Time event={context.event} class="text-sm text-muted-foreground/70" />
    {/if}

    {#if children}
      {@render children()}
    {/if}
  </div>
</header>