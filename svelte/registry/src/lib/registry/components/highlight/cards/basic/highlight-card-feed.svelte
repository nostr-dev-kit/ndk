<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import { cn } from '../../../utils/cn.js';
  import { Highlight } from '../../../ui/highlight/index.js';
  import { EventCard } from '../event-card/index.js';

  interface Props {
    ndk: NDKSvelte;

    event: NDKEvent;

    showHeader?: boolean;

    showActions?: boolean;

    class?: string;

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

<Highlight.Root {ndk} {event} variant="feed" class={cn(className)}>
  <article
    data-highlight-card-feed=""
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
          <Highlight.Content class="text-card-foreground font-serif leading-relaxed text-center text-2xl sm:text-3xl md:text-4xl" />
        </div>
      </div>

      <!-- Source badge -->
      <Highlight.Source class="flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-border rounded text-xs text-muted-foreground hover:bg-background transition-colors absolute bottom-2 right-2">
        {#snippet children({ source })}
          {#if source}
            {#if source.type === 'web'}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" ></path>
              </svg>
            {:else}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" ></path>
              </svg>
            {/if}
            <span class="truncate max-w-[200px]">{source.displayText}</span>
          {/if}
        {/snippet}
      </Highlight.Source>
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
</Highlight.Root>
