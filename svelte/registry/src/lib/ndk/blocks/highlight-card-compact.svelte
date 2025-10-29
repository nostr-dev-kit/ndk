<!-- @ndk-version: highlight-card-compact@0.2.0 -->
<!--
  @component HighlightCard.Compact
  Pre-composed compact variant with inline metadata and left marker line.

  @example
  ```svelte
  <HighlightCard.Compact {ndk} {event} />
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';
  import Root from '../highlight-card/highlight-card-root.svelte';
  import Content from '../highlight-card/highlight-card-content.svelte';
  import { HIGHLIGHT_CARD_CONTEXT_KEY, type HighlightCardContext } from '../highlight-card/context.svelte.js';
  import TimeAgo from '$lib/ndk/time-ago/time-ago.svelte';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Highlight event (kind 9802) */
    event: NDKEvent;

    /** Show author name */
    showAuthor?: boolean;

    /** Show timestamp */
    showTimestamp?: boolean;

    /** Show source info */
    showSource?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    event,
    showAuthor = true,
    showTimestamp = true,
    showSource = true,
    class: className = '',
  }: Props = $props();

  // Fetch author profile
  const profileFetcher = createProfileFetcher(() => ({ user: event.author }), ndk);

  const authorName = $derived(
    profileFetcher.profile?.displayName ||
      profileFetcher.profile?.name ||
      'Anonymous'
  );
</script>

<Root {ndk} {event} variant="compact" class={cn(className)}>
  <div
    class="block p-4 hover:bg-card/30 transition-colors rounded-lg group"
  >
    <div class="relative">
      <!-- Highlight marker line on the left -->
      <div
        class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 to-primary rounded-full"
      />

      <div class="pl-4">
        <!-- Highlighted text -->
        <div class="mb-3 relative">
          <Content fontSize="text-base" class="text-foreground leading-relaxed font-serif italic" />
        </div>

        <!-- Meta information -->
        {#snippet context()}
          {@const ctx = getContext<HighlightCardContext>(HIGHLIGHT_CARD_CONTEXT_KEY)}
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            {#if showAuthor}
              <span>{authorName}</span>
            {/if}
            {#if showTimestamp}
              <span>·</span>
              <TimeAgo timestamp={event.created_at} />
            {/if}
            {#if showSource && ctx.state.source}
              <span>·</span>
              <span class="flex items-center gap-1">
                {#if ctx.state.source.type === 'web'}
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                {:else}
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                {/if}
                {ctx.state.source.displayText}
              </span>
            {/if}
          </div>
        {/snippet}
        {@render context()}
      </div>
    </div>
  </div>
</Root>
