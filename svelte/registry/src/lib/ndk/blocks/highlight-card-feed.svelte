<!-- @ndk-version: highlight-card-feed@0.2.0 -->
<!--
  @component HighlightCard.Feed
  Pre-composed feed variant with header, book-page style content, source badge, and actions.

  @example
  ```svelte
  <HighlightCard.Feed {ndk} {event} />
  ```
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import Root from '../highlight-card/highlight-card-root.svelte';
  import Content from '../highlight-card/highlight-card-content.svelte';
  import Source from '../highlight-card/highlight-card-source.svelte';
  import { EventCard } from '../event-card/index.js';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Highlight event (kind 9802) */
    event: NDKEvent;

    /** Show author header */
    showHeader?: boolean;

    /** Show actions footer */
    showActions?: boolean;

    /** Additional CSS classes */
    class?: string;

    /** Custom actions slot */
    actions?: Snippet;
  }

  let {
    ndk,
    event,
    showHeader = true,
    showActions = true,
    class: className = '',
    actions,
  }: Props = $props();
</script>

<Root {ndk} {event} variant="feed" class={cn(className)}>
  <article
    class="p-3 sm:p-4 hover:bg-card/30 transition-colors border-b border-border"
  >
    <!-- Author header -->
    {#if showHeader}
      <div class="mb-3">
        <EventCard.Root {ndk} {event}>
          <EventCard.Header variant="full" avatarSize="md" showTimestamp={true} />
        </EventCard.Root>
      </div>
    {/if}

    <!-- Book page style highlight -->
    <div
      class="relative rounded-lg overflow-hidden bg-card border border-border shadow-lg mb-2"
    >
      <!-- Content -->
      <div
        class="relative flex flex-col items-center justify-center py-12 sm:py-16 px-8 sm:px-12 min-h-[200px] max-h-[600px]"
      >
        <div class="relative z-10">
          <Content />
        </div>
      </div>

      <!-- Source badge -->
      <Source position="bottom-right" size="md" />
    </div>

    <!-- Actions -->
    {#if showActions}
      <EventCard.Root {ndk} {event}>
        <EventCard.Actions>
          {#if actions}
            {@render actions()}
          {/if}
        </EventCard.Actions>
      </EventCard.Root>
    {/if}
  </article>
</Root>
