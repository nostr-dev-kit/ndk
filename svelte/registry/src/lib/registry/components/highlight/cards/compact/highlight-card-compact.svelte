<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../../../utils/cn.js';
  import { Highlight } from '../../../ui/highlight/index.js';
  import { User } from '../../../ui/user';
  import { HIGHLIGHT_CONTEXT_KEY, type HighlightContext } from '../../../ui/highlight/highlight.context.js';
  import { createTimeAgo } from '../../../utils/time-ago.svelte.js';

  interface Props {
    ndk: NDKSvelte;

    event: NDKEvent;

    showAuthor?: boolean;

    showTimestamp?: boolean;

    showSource?: boolean;

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

  // Create reactive time ago string
  const timeAgo = createTimeAgo(event.created_at);
</script>

<Highlight.Root {ndk} {event} variant="compact" class={cn(className)}>
  <div
    data-highlight-card-compact=""
    class="block p-4 hover:bg-card/30 transition-colors rounded-lg group"
  >
    <div class="relative">
      <!-- Highlight marker line on the left -->
      <div
        class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 to-primary rounded-full"
      ></div>

      <div class="pl-4">
        <!-- Highlighted text -->
        <div class="mb-3 relative">
          <Highlight.Content class="text-foreground leading-relaxed font-serif italic text-base" />
        </div>

        <!-- Meta information -->
        {#snippet context()}
          {@const ctx = getContext<HighlightContext>(HIGHLIGHT_CONTEXT_KEY)}
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            {#if showAuthor}
              <User.Root {ndk} user={event.author}>
                <User.Name class="inline" field="displayName" />
              </User.Root>
            {/if}
            {#if showTimestamp}
              <span>·</span>
              <time>{timeAgo}</time>
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
                    ></path>
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
                    ></path>
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
</Highlight.Root>
