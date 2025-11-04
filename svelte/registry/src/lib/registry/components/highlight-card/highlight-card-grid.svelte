<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../../utils/cn.js';
  import { Highlight } from '../../ui/highlight/index.js';
  import { User } from '../../ui/user';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Highlight event (kind 9802) */
    event: NDKEvent;

    /** Show author info below */
    showAuthor?: boolean;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    ndk,
    event,
    showAuthor = true,
    class: className = '',
  }: Props = $props();
</script>

<Highlight.Root {ndk} {event} variant="grid" class={cn(className)}>
  <article class="hover:bg-card/30 transition-colors w-full">
    <!-- Book page style highlight -->
    <div
      class="relative aspect-square rounded-lg overflow-hidden bg-card border border-border shadow-lg w-full"
    >
      <!-- Content -->
      <div
        class="relative flex flex-col items-center justify-center p-4 sm:p-6 min-h-[150px]"
      >
        <div class="relative z-10">
          <Highlight.Content class="text-card-foreground font-serif leading-relaxed text-center line-clamp-6 text-base" />
        </div>
      </div>

      <!-- Highlighter icon (bottom left corner) -->
      <div class="absolute bottom-2 left-2">
        <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M18.5 1.15a2.25 2.25 0 00-3.18 0L3.78 12.69a2.25 2.25 0 000 3.18l4.35 4.35a2.25 2.25 0 003.18 0L22.85 8.68a2.25 2.25 0 000-3.18l-4.35-4.35zM9.93 18.84L5.16 14.07 15.3 3.93l4.77 4.77-10.14 10.14z"
          />
          <path d="M2.5 22.5h10v1.5h-10z" opacity="0.5" />
        </svg>
      </div>

      <!-- Source badge -->
      <Highlight.Source class="flex items-center gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-sm border border-border rounded text-[10px] text-muted-foreground hover:bg-background transition-colors absolute bottom-2 right-2">
        {#snippet children({ source })}
          {#if source}
            {#if source.type === 'web'}
              <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            {:else}
              <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            {/if}
            <span class="truncate max-w-[100px]">{source.displayText}</span>
          {/if}
        {/snippet}
      </Highlight.Source>
    </div>

    <!-- Author info below -->
    {#if showAuthor}
      <User.Root {ndk} user={event.author}>
        <div class="flex items-center gap-2 mt-2 px-1">
          <User.Avatar class="w-5 h-5 rounded-full" />
          <User.Name class="text-xs text-muted-foreground truncate" field="displayName" />
        </div>
      </User.Root>
    {/if}
  </article>
</Highlight.Root>
